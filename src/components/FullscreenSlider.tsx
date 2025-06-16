/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useRef, useEffect, ReactNode, Children, RefObject } from "react";
import { Box } from "@mui/material";
import slideStore from './slideStore';


interface FullscreenSliderProps {
  children: ReactNode;
  imageCount: number;
  slideIndex: number;
  isClick: React.RefObject<boolean>;
  isZoomed: boolean;
  windowSize: { width: number; height: number };
  show: boolean;
  handleZoomToggle: (e: React.PointerEvent<HTMLImageElement> | React.TouchEvent<HTMLImageElement>, imageRef: React.RefObject<HTMLImageElement | null>) => void;
  imageRefs: React.RefObject<HTMLImageElement | null>[];
  setIsZoomed: (isZoomed: boolean) => void;
  cells: RefObject<{ element: HTMLElement; index: number }[]>;
  isPinching: React.RefObject<boolean>;
  scale: number;
  isTouchPinching: React.RefObject<boolean>;
  showFullscreenSlider: boolean;
  isWrapping: RefObject<boolean>;
}

const FullscreenSlider = ({
  children,
  imageCount,
  slideIndex,
  isClick,
  isZoomed,
  windowSize,
  show,
  handleZoomToggle,
  imageRefs,
  setIsZoomed,
  cells,
  isPinching,
  scale,
  isTouchPinching,
  showFullscreenSlider,
  isWrapping
}: FullscreenSliderProps) => {
  const friction = 0.28;
  const attraction = 0.025;
  const slider = useRef<HTMLDivElement | null>(null);
  const isPointerDown = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const x = useRef(0);
  const y = useRef(0);
  const dragX = useRef(0);
  const dragY = useRef(0);
  const previousDragX = useRef<number>(0);
  const previousDragY = useRef<number>(0);
  const dragStartPositionX = useRef(0);
  const dragStartPositionY = useRef(0);
  const dragMoveTime = useRef<Date | null>(null);
  const velocityX = useRef(0);
  const velocityY = useRef(0);
  const isAnimating = useRef(false);
  const restingFrames = useRef(0);
  const selectedIndex = useRef(0);
  const sliderWidth = useRef(0);
  const isScrolling = useRef(false);
  const isDragSelect = useRef<boolean>(false);
  const slides = useRef<{ cells: { element: HTMLElement }[] }[]>([]);
  const firstCellInSlide = useRef<HTMLElement | null>(null);
  const lastTranslateX = useRef<number>(0);
  const hasPositioned = useRef<boolean>(false);
  const clickedImgMargin = useRef(false);
  const VERT_ANGLE_MIN =  60;
  const VERT_ANGLE_MAX = 120;
  const isVerticalScroll = useRef(false);
  const isClosing = useRef(false);

  useEffect(() => {  
    const childrenArray = Children.toArray(children);

    slides.current = [];
  
    if (imageCount > 1) {
      for (let i = 1; i < childrenArray.length - 1; i++) {
        slides.current.push({
          cells: [cells.current[i]],
        });
      }
    } else {
      for (let i = 0; i < childrenArray.length; i++) {
        slides.current.push({
          cells: [cells.current[i]],
        });
      }
    }
    
  }, [children]);

  useEffect(() => {
    if (slider.current) {
      let totalWidth = 0;
      const sliderChildren = slider.current.children;

      if (imageCount > 1) {
        for (let i = 0; i < sliderChildren.length - 2; i++) {
          totalWidth += sliderChildren[i].getBoundingClientRect().width;
        }
      } else {
        for (let i = 0; i < sliderChildren.length; i++) {
          totalWidth += sliderChildren[i].getBoundingClientRect().width;
        }
      }

      sliderWidth.current = totalWidth;
    }
  }, [children]);

  useEffect(() => {
    if (!slider.current || hasPositioned.current || sliderWidth.current === 0) return;
    const counter = document.querySelector(".counter");
    if (counter) {
      counter.textContent = `${!isWrapping.current ? slideIndex + 1 : slideIndex} / ${imageCount}`;
    }
    if (slideIndex === 1 && isWrapping.current === true) {
      selectedIndex.current = 0;
      firstCellInSlide.current = slides.current[0].cells[0]?.element;
      hasPositioned.current = true;
      return;
    }
    if (slideIndex === 0 && !isWrapping.current) {
      selectedIndex.current = 0;
      firstCellInSlide.current = slides.current[0].cells[0]?.element;
      hasPositioned.current = true;
      return;
    }
    let actualIndex = slideIndex - 1;
    actualIndex = ((actualIndex % imageCount) + imageCount) % imageCount;
    if (actualIndex === 0) actualIndex = imageCount;
    const finalIndex = isWrapping.current === true ? actualIndex : slideIndex;
    selectedIndex.current = finalIndex;
    const slide = slider.current.clientWidth * finalIndex;
    setTimeout(() => {
      if (!slider.current) return;
      x.current = -slide;
      velocityX.current = 0;
      positionSlider();
    }, 0);
    firstCellInSlide.current = slides.current[finalIndex].cells[0]?.element;
    hasPositioned.current = true;
  }, [show, slides.current]);

  function getCurrentTransform(slide: HTMLElement | null) {
    if (!slide) return { x: 0, y: 0 };
    const computedStyle = window.getComputedStyle(slide);
    const transform = computedStyle.transform;
    if (!transform || transform === 'none') return { x: 0, y: 0 };

    const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
    if (!matrixMatch) return { x: 0, y: 0 };

    const matrixValues = matrixMatch[1].split(',').map(parseFloat);
    const tx = matrixValues[4] || 0;
    const ty = matrixValues[5] || 0;

    return { x: tx, y: ty };
  }

  interface PointerEventExtended extends PointerEvent {
    touches?: TouchList;
  }

  function handlePointerStart(e: PointerEventExtended) {
    if (isZoomed) return;
    isScrolling.current = false;
    isPointerDown.current = true;
    isClick.current = true;
    console.log('triggered')

    const transformValues = getCurrentTransform(slider.current);
    const translateX = transformValues.x;
    const translateY = transformValues.y;

    dragStartPositionX.current = translateX;
    dragStartPositionY.current = translateY;

    dragX.current = translateX;
    dragY.current = translateY;

    if (e.touches && e.touches.length > 0) {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
    } else {
      startX.current = e.clientX;
      startY.current = e.clientY;
    };
    
    startAnimation();
  };

  function startAnimation() {
    if (isAnimating.current) return;

    isAnimating.current = true;
    restingFrames.current = 0;
    animate();
  };

  function animate() {
    if (isScrolling.current === true || (isClick.current && clickedImgMargin.current) || isTouchPinching.current === true || isClosing.current || isPinching.current === true) {
      isAnimating.current = false;
      restingFrames.current = 0;
      isClosing.current = false;
      return;
    };
    applyDragForce();
    applySelectedAttraction();

    const previousX = x.current;
    const previousY = y.current;

    integratePhysics();
    positionSlider();
    settle(previousX, previousY);

    if (isAnimating.current) requestAnimationFrame(() => animate());
  };

  function applyDragForce() {
    if (!isPointerDown.current) return;
  
    const dragVelocityX = dragX.current - x.current;
    const dragVelocityY = dragY.current - y.current;
    const dragForceX = dragVelocityX - velocityX.current;
    const dragForceY = dragVelocityY - velocityY.current;

    applyForce(dragForceX, dragForceY);
  };

  function applyForce(forceX: number, forceY: number) {
    velocityX.current += forceX;
    velocityY.current += forceY;
  };

  function integratePhysics() {
    x.current += velocityX.current;
    y.current += velocityY.current;

    velocityX.current *= getFrictionFactor();
    velocityY.current *= getFrictionFactor();
  };

  function getFrictionFactor() {
    return 1 - friction;
  }

  function positionSlider() {
    let currentPositionX = x.current;
    const currentPositionY = y.current;
    if (!isClick.current && imageCount > 1) {
      currentPositionX = ((currentPositionX % sliderWidth.current) + sliderWidth.current) % sliderWidth.current;
      currentPositionX += -sliderWidth.current;
    }
    setTranslateX(currentPositionX, currentPositionY);
  };

  function settle(previousX: number, previousY: number) {
    const isRestingX = !isPointerDown.current && Math.round(x.current * 100) === Math.round(previousX * 100);
    const isRestingY = !isPointerDown.current && Math.round(y.current * 100) === Math.round(previousY * 100);
    if (isRestingX && isRestingY) {
      restingFrames.current++;
    };

    if (restingFrames.current > 2) {
      isAnimating.current = false;
      positionSlider();
    };
  };

  function setTranslateX(x: number, y: number) {
    if (!slider.current) return;
    let translateX;
    let translateY;
    const transformValues = getCurrentTransform(slider.current);
    const currentX = transformValues.x;
    const currentY = transformValues.y;
    if (isVerticalScroll.current) {
      translateX = currentX + 'px';
      translateY = getPositionValue(y);
    } else {
      translateX = getPositionValue(x);
      const easeFactor = 0.2;
      const nextY = currentY + (0 - currentY) * easeFactor;
      translateY = `${nextY}px`;
    }
    slider.current.style.transform = `translate3d(${translateX},${translateY},0)`;
  };

  function getPositionValue(position: number) {
    return Math.round(position) + 'px';
  };

  interface PointerMoveEvent extends PointerEvent {
    touches?: TouchList;
  }

  function handlePointerMove(e: PointerMoveEvent) {
    e.preventDefault();
    if (isZoomed) return;
    if (!isPointerDown.current) return;
    
    previousDragX.current = dragX.current;
    previousDragY.current = dragY.current;

    let currentX: number;
    let currentY: number;

    if (e.touches && e.touches.length > 0) {
      currentX = e.touches[0].clientX;
      currentY = e.touches[0].clientY;
    } else {
      currentX = e.clientX;
      currentY = e.clientY;
    }

    const moveX = currentX - startX.current;
    const moveY = currentY - startY.current;

    if (Math.abs(moveX) > 0 || Math.abs(moveY) > 0) {
      isClick.current = false;
    }

    dragX.current = dragStartPositionX.current + moveX;
    dragY.current = dragStartPositionY.current + moveY;

    if (imageCount === 1) {
      const originBound = Math.max(0, dragStartPositionX.current);

      if (dragX.current > originBound) {
        dragX.current = (dragX.current + originBound) * 0.5;
      }

      const lastSlide = (slides.current.length - 1) * cells.current[0].element.offsetWidth;
      const endBound = Math.min(-lastSlide, dragStartPositionX.current);

      if (dragX.current < endBound) {
        dragX.current = (dragX.current + endBound) * 0.5;
      }
    }

    const angle = Math.abs(Math.atan2(moveY, moveX) * (180 / Math.PI));

    const isVertical = angle >= VERT_ANGLE_MIN && angle <= VERT_ANGLE_MAX;

    isVerticalScroll.current = isVertical;

    dragMoveTime.current = new Date();
  };

  function handlePointerEnd(e: React.PointerEvent<HTMLImageElement>) {
    if (isZoomed) return;
    if (!isPointerDown.current) return;
    isPointerDown.current = false;

    if (isVerticalScroll.current) {
      const deltaY = Math.abs(previousDragY.current);
      const speedThreshold = 0.1;
      const distanceThreshold = windowSize.height * 0.3;
      if (Math.abs(velocityY.current) > speedThreshold || deltaY > distanceThreshold) {
        const closeButton = document.querySelector(
          '.close-button'
        ) as HTMLElement | null;
        if (!slider.current) return;
        isClosing.current = true;
        closeButton?.click();
      }
    };

    let index = dragEndRestingSelect();

    if (isClick.current) {

      const closeButton = document.querySelector(".close-button") as HTMLElement | null;
      const clickedImg = (e.target as HTMLElement).closest("img");
      if (!clickedImg) {
        clickedImgMargin.current = true;
        closeButton?.click();
      }

      if ((e.target instanceof HTMLImageElement)) {
        const targetImg = (e.target as HTMLElement).closest("img") as HTMLImageElement | null;
        
        if (!targetImg) return;
  
        const imgIndex = targetImg.dataset.index;

        if (imgIndex === undefined) return;
  
        const matchedRef = imageRefs[parseInt(imgIndex)];

        handleZoomToggle(e, matchedRef);
        setIsZoomed(true);
      }
      
    } else {
      console.log('dragged');
      if (index === selectedIndex.current || (index === slides.current.length && selectedIndex.current !== slides.current.length - 1)) {
        index += dragEndBoostSelect();
      }
    }

    isDragSelect.current = true;

    select(index);

    isDragSelect.current = false;
  };

  function dragEndBoostSelect() {
    const movedAt = dragMoveTime.current;
    if (
      !movedAt ||
      (new Date().getTime() - movedAt.getTime()) > 100
    ) {
      return 0;
    }
  
    const delta = previousDragX.current - dragX.current;

    if (delta > 0) {
      return 1;
    } else if (delta < 0) {
      return -1;
    };
    return 0;
  };

  function applySelectedAttraction() {
    if (isPointerDown.current) return;
    if (!slider.current) return;

    const slide = slider.current.clientWidth * selectedIndex.current;

    if (isVerticalScroll.current) {
      const distance = -y.current;
      const force = distance * attraction;
      velocityY.current += force;
    } else {
      const distance = -slide - x.current;
      const force = distance * attraction;
      velocityX.current += force;
    }    
  };

  function dragEndRestingSelect() {
    const restingX = getRestingPosition();

    const distance = Math.abs(getSlideDistance(-restingX, selectedIndex.current));

    const positiveResting = getClosestResting(restingX, distance, 1);
    const negativeResting = getClosestResting(restingX, distance, -1);
    
    return positiveResting.distance < negativeResting.distance ?
      positiveResting.index : negativeResting.index;
  };

  function getRestingPosition() {
    return x.current + velocityX.current / (1 - getFrictionFactor());
  };

  function getSlideDistance(x: number, index: number) {
    if (!slider.current) return 1;
    const length = slides.current.length;
    const cellWidth = slider.current.children[0].clientWidth;
    const cellIndex = ((index % length) + length) % length;
    const cell = cellWidth * cellIndex;
    const wrap = sliderWidth.current * Math.floor(index/length);

    return x - (cell + wrap);
  };

  function getClosestResting(restingX: number, distance: number, increment: number) {
    let index = selectedIndex.current;
    let minDistance = Infinity;
  
    while (distance < minDistance) {
      index += increment;
      minDistance = distance;
      distance = getSlideDistance(-restingX, index);
      if (distance === null) break;

      distance = Math.abs(distance);
    };
  
    return {
      distance: minDistance,
      index: index - increment,
    };
  };

  function previous() {
    isScrolling.current = false;
    isPinching.current = false;
    select(selectedIndex.current - 1);
  }
  
  function next() {
    isScrolling.current = false;
    isPinching.current = false;
    select(selectedIndex.current + 1);
  }  

  function select(index: number) {
    if (imageCount > 1) {
      wrapSelect(index);
    }
    const length = slides.current.length;
    index = ((index % length) + length) % length;
    selectedIndex.current = index;
    slideStore.setSlideIndex(index);
    firstCellInSlide.current = slides.current[index].cells[0]?.element;
    let actualIndex = index + 1;
    actualIndex = ((actualIndex % length) + length) % length;
    if (actualIndex === 0) actualIndex = imageCount;
    const counter = document.querySelector(".counter");
    if (counter) {
      counter.textContent = `${actualIndex} / ${imageCount}`;
    }
    startAnimation();
  };

  function getTranslateX(element: HTMLElement): number {
    const style = window.getComputedStyle(element);
    const matrix = new DOMMatrix(style.transform);
    return matrix.m41 || 0;
  }

  useEffect(() => {
    if (!slider.current || !firstCellInSlide.current) return;
    lastTranslateX.current = getTranslateX(firstCellInSlide.current);
    if (selectedIndex.current === 0) {
      x.current = 0;
      const currentPosition = x.current;
      setTranslateX(currentPosition, 0);
    } else {
      x.current = -(slider.current.clientWidth * selectedIndex.current);
      const currentPosition = x.current;
      setTranslateX(currentPosition, 0);
    }
  }, [windowSize]);

  useEffect(() => {
    if (!slider.current || !firstCellInSlide.current || !isPinching.current) return;
    lastTranslateX.current = getTranslateX(firstCellInSlide.current);
    if (selectedIndex.current === 0) {
      x.current = 0;
      const currentPosition = x.current;
      setTranslateX(currentPosition, 0);
    } else {
      x.current = -(slider.current.clientWidth * selectedIndex.current);
      const currentPosition = x.current;
      setTranslateX(currentPosition, 0);
    }
  }, [scale]);

  useEffect(() => {
    if (!slider.current || !firstCellInSlide.current) return;
    if (isTouchPinching.current === true) {
      lastTranslateX.current = getTranslateX(firstCellInSlide.current);
      if (selectedIndex.current === 0) {
        x.current = 0;
        const currentPosition = x.current;
        setTranslateX(currentPosition, 0);
      } else {
        x.current = -(slider.current.clientWidth * selectedIndex.current);
        const currentPosition = x.current;
        setTranslateX(currentPosition, 0);
      }
    }
  }, [scale]);

  function wrapSelect(index: number) {
    if (!slider.current) return;

    const length = slides.current.length;
    const slideableWidth = sliderWidth.current;
    const selectedIdx = selectedIndex.current;

    if (!isDragSelect.current) {
      const wrapIndex = ((index % length) + length) % length;

      const delta = Math.abs(wrapIndex - selectedIdx);
      const backWrapDelta = Math.abs((wrapIndex + length) - selectedIdx);
      const forwardWrapDelta = Math.abs((wrapIndex - length) - selectedIdx);

      if (backWrapDelta < delta) {
        index += length;
      } else if (forwardWrapDelta < delta) {
        index -= length;
      }
    }

    if (index < 0) {
      x.current -= slideableWidth;
    } else if (index >= length) {
      x.current += slideableWidth;
    }
  }

  interface SliderElement extends HTMLDivElement {
    style: CSSStyleDeclaration;
  }

  function getCurrentXFromTransform(slider: SliderElement): number {
    const computedStyle = window.getComputedStyle(slider);
    const transform = computedStyle.transform;
    if (!transform || transform === 'none') return 0;

    const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
    if (!matrixMatch) return 0;

    const matrixValues = matrixMatch[1].split(',').map(parseFloat);
    const tx = matrixValues[4];

    return tx;
  }

  interface WheelEventExtended extends WheelEvent {
    deltaX: number;
  }

  function isPinchGesture(e: WheelEvent): boolean {
    if (e.ctrlKey) return true;
  
    const absDeltaX = Math.abs(e.deltaX);
    const absDeltaY = Math.abs(e.deltaY);
  
    if (absDeltaX < 1 && absDeltaY < 1) return false;
  
    const ratio = absDeltaX / absDeltaY;
    if (ratio >= 0.8 && ratio <= 1.2) {
      return true;
    }
  
    return false;
  }

  const handleWheel = (e: WheelEventExtended) => {
    e.preventDefault();
    if (isZoomed) return;
    if (!slider.current) return;
    if (isPinchGesture(e)) return;
    if (e.ctrlKey || Math.abs(e.deltaY) > Math.abs(e.deltaX)) return;
    if (imageCount === 1) return;
    isScrolling.current = true;
    isPinching.current = false;
    isTouchPinching.current = false;

    let translateX = getCurrentXFromTransform(slider.current);
    translateX -= e.deltaX;

    let currentPosition = ((translateX % sliderWidth.current) + sliderWidth.current) % sliderWidth.current;
    currentPosition += -sliderWidth.current;
    setTranslateX(currentPosition, 0);

    const index = Math.round(Math.abs(currentPosition) / slider.current.clientWidth);
    selectedIndex.current = index;
    
    slideStore.setSlideIndex(index);
    let actualIndex = index + 1;
    actualIndex = ((actualIndex % imageCount) + imageCount) % imageCount;
    if (actualIndex === 0) actualIndex = imageCount;
    const counter = document.querySelector(".counter");
    if (counter) {
      counter.textContent = `${actualIndex} / ${imageCount}`;
    }

    x.current = currentPosition;
    firstCellInSlide.current = slides.current[index].cells[0]?.element;
  };

  useEffect(() => {
    const sliderEl = slider.current;
    if (!sliderEl) return;

    // ——— 1) Track active pointers in capture ———
    const activePointers = new Set<number>();
    const onDownCap = (e: PointerEvent) => {
      activePointers.add(e.pointerId);
    };
    const onUpCap = (e: PointerEvent) => {
      activePointers.delete(e.pointerId);
    };
    window.addEventListener('pointerdown',  onDownCap,   { capture: true });
    window.addEventListener('pointerup',    onUpCap,     { capture: true });
    window.addEventListener('pointercancel', onUpCap,     { capture: true });

    // ——— 2) Intercept any 2nd finger down on the slider ———
    const interceptSecondFinger = (e: PointerEvent) => {
      if (activePointers.size > 1) {
        console.log('more than one pointer', activePointers.size)
        // swallow it so handlePointerStart never runs
        e.stopImmediatePropagation();
        isPointerDown.current = false;
        isAnimating.current = false;
        restingFrames.current = 0;
        e.preventDefault();
        e.stopPropagation();
      }
    };
    sliderEl.addEventListener('pointerdown', interceptSecondFinger, { capture: true });

    // ——— 3) Wire up your existing bubble‐phase handlers ———
    sliderEl.addEventListener('pointerdown', handlePointerStart);
    window.addEventListener('pointermove',   handlePointerMove);
    window.addEventListener('pointerup',     (e) => handlePointerEnd(e as any));
    window.addEventListener('wheel',         handleWheel, { passive: false });

    return () => {
      // clean up everything
      window.removeEventListener('pointerdown',  onDownCap,   { capture: true });
      window.removeEventListener('pointerup',    onUpCap,     { capture: true });
      window.removeEventListener('pointercancel', onUpCap,     { capture: true });

      sliderEl.removeEventListener('pointerdown', interceptSecondFinger, { capture: true });

      sliderEl.removeEventListener('pointerdown', handlePointerStart);
      window.removeEventListener('pointermove',   handlePointerMove);
      window.removeEventListener('pointerup',     (e) => handlePointerEnd(e as any));
      window.removeEventListener('wheel',         handleWheel);
    };
  }, [
    handlePointerStart,
    handlePointerMove,
    handlePointerEnd,
    handleWheel,
    slider.current,
  ]);

  useEffect(() => {
    const leftChevron = document.querySelector(".left-chevron");
    const rightChevron = document.querySelector(".right-chevron");
    leftChevron?.addEventListener("click", previous);
    rightChevron?.addEventListener("click", next);
    return () => {
      leftChevron?.removeEventListener("click", previous);
      rightChevron?.removeEventListener("click", next);
    }
  }, []);
  

  return (
    <Box sx={{ position: 'relative' }}>
      <Box 
        ref={slider}
        className={'fullscreen_slider'}
        sx={{ 
          overflow: "visible",
          touchAction: "none",
          position: 'absolute',
          left: 0,
          width: '100%',
          height: '100%',
          cursor: 'grab',
          willChange: 'opacity',
          opacity: showFullscreenSlider ? '1' : '0',
          '&:active': {
            cursor: 'grabbing'
          }
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default FullscreenSlider;