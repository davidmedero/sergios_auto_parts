/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useRef, useEffect, ReactNode, cloneElement, Children, useState, createRef, Dispatch, SetStateAction, ReactElement, HTMLAttributes, ClassAttributes, RefObject, useLayoutEffect } from "react";
import { Box, IconButton, SvgIcon } from "@mui/material";
import type SimpleBarCore from 'simplebar';

interface ProductImageSliderProps {
  children: ReactNode;
  imageCount: number;
  windowSize: { width: number; height: number };
  isClick: RefObject<boolean>;
  expandableImgRefs: RefObject<RefObject<HTMLImageElement | null>[]>;
  overlayDivRef: RefObject<HTMLDivElement | null>;
  setSlideIndex: (index: number) => void;
  setShowFullscreenModal: (show: boolean) => void;
  thumbnailRefs: RefObject<(HTMLImageElement | null)[]>;
  simpleBarRef: RefObject<SimpleBarCore | null>;
  thumbnailContainerRef: RefObject<HTMLDivElement | null>;
  setFullscreenPosition: Dispatch<SetStateAction<DOMRect>>;
  setShowFullscreenSlider: Dispatch<SetStateAction<boolean>>;
  showFullscreenSlider: boolean;
  isWrapping: RefObject<boolean>;
}

// --- 1) Define the prop shape we'll be adding ---
type CarouselChildProps =
  HTMLAttributes<HTMLElement> &
  ClassAttributes<HTMLElement> & {
    style?: React.CSSProperties
  }

// --- 2) A helper to clone any slide with the right key, index & transform ---
function cloneSlide(
  child: ReactElement<any>,
  key: string,
  elementIndex: number,
  translateIndex: number,
  cells: React.RefObject<
    { element: HTMLElement; index: number }[]
  >
): ReactElement<CarouselChildProps> {
  return cloneElement<CarouselChildProps>(child, {
    key,
    ref: (el: HTMLElement | null) => {
      if (el && !cells.current.some(c => c.element === el)) {
        cells.current.push({ element: el, index: elementIndex })
      }
    },
    style: {
      ...child.props.style,
      transform: `translateX(${translateIndex * 100}%)`,
    },
  })
}

const ProductImageSlider = ({
  children,
  imageCount,
  windowSize,
  isClick,
  expandableImgRefs,
  overlayDivRef,
  setSlideIndex,
  setShowFullscreenModal,
  thumbnailRefs,
  simpleBarRef,
  thumbnailContainerRef,
  setFullscreenPosition,
  setShowFullscreenSlider,
  showFullscreenSlider,
  isWrapping
}: ProductImageSliderProps) => {
  const slider = useRef<HTMLDivElement | null>(null);
  const [firstChildWidth, setFirstChildWidth] = useState(0);
  const isPointerDown = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const x = useRef(0);
  const dragX = useRef(0);
  const previousDragX = useRef<number>(0);
  const dragStartPosition = useRef(0);
  const dragMoveTime = useRef<Date | null>(null);
  const velocity = useRef(0);
  const isAnimating = useRef(false);
  const restingFrames = useRef(0);
  const selectedIndex = useRef(0);
  const sliderWidth = useRef(0);
  const isScrolling = useRef(false);
  const [clonedChildren, setClonedChildren] = useState<React.ReactElement[]>([]);
  const [visibleImages, setVisibleImages] = useState(1);
  const friction = 0.28;
  const attraction = 0.025;
  const visibleImagesRef = useRef(0);
  const firstCellInSlide = useRef<HTMLElement | null>(null);
  const cells = useRef<{ element: HTMLElement, index: number }[]>([]);
  const slides = useRef<{ cells: { element: HTMLElement }[], target: number }[]>([]);
  const isDragSelect = useRef<boolean>(false);
  const lastTranslateX = useRef<number>(0);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const isClosing = useRef(false);
  const hasPositioned = useRef<boolean>(false);

  useEffect(() => {
    if (!cells.current?.[0]?.element) return;
    
    const updateWidth = () => {
      requestAnimationFrame(() => {
        if (!cells.current) return;
          const width = cells.current[0]?.element.clientWidth;

          if (width > 0 && width !== firstChildWidth) {
            setFirstChildWidth(width);
          }
      });
    };
  
    const observer = new ResizeObserver(() => updateWidth());
    observer.observe(cells.current[0].element);
  
    return () => observer.disconnect();
  
  }, [children, clonedChildren]);

  const calculateVisibleImages = () => {
    if (firstChildWidth === 0) return 1;
    const containerWidth = slider.current?.clientWidth || window.innerWidth;
    return Math.max(1, Math.ceil(containerWidth / firstChildWidth));
  };

  useEffect(() => {
    if (!slider.current) return;
    console.log('rvwerv')
  
    const images = calculateVisibleImages();
    const childrenArray = Children.toArray(children);
    const childCount = childrenArray.length;
  
    setVisibleImages(images);
    visibleImagesRef.current = images;

    if (childCount <= 2 && images > 1) {
      isWrapping.current = false;
    } else if (childCount > 2 && images > 1) {
      isWrapping.current = true;
    } else if (childCount > 1 && images === 1) {
      isWrapping.current = true;
    } else if (childCount === 1) {
      isWrapping.current = false;
    }
  
    if (childCount === 0) return;

    cells.current = [];
  
    const slides: ReactElement<CarouselChildProps>[] = []
    
    // only do clones if we need infinite wrapping
    if (childCount > images) {
      // before-clones: map [-images .. -1] → real indices [childCount-images .. childCount-1]
      const before = childrenArray.slice(-images).map((c, i) =>
        cloneSlide(
          c as ReactElement<any>,
          `before-${i}`,
          -images + i,         // elementIndex
          -images + i,         // translateIndex
          cells
        )
      )

      // original slides: [0 .. childCount-1]
      const originals = childrenArray.map((c, i) =>
        cloneSlide(
          c as ReactElement<any>,
          `original-${i}`,
          i,              // elementIndex
          i,              // translateIndex
          cells
        )
      )

      // after-clones: map [0 .. images-1] → real indices [childCount .. childCount+images-1]
      const after = childrenArray.slice(0, images).map((c, i) =>
        cloneSlide(
          c as ReactElement<any>,
          `after-${i}`,
          i,              // elementIndex
          childCount + i, // translateIndex
          cells
        )
      )

      slides.push(...before, ...originals, ...after)
    } else {
      // no wrapping needed
      slides.push(
        ...childrenArray.map((c, i) =>
          cloneSlide(
            c as ReactElement<any>,
            `original-${i}`,
            i,
            i,
            cells
          )
        )
      )
    }

    setClonedChildren(slides)

  }, [firstChildWidth]);

  useEffect(() => {
    if (!slider.current) return;
  
    const childrenArray = Children.toArray(children);

    const imgOffset = !isWrapping.current ? 0 : visibleImages * 2;
    if (clonedChildren.length !== Children.toArray(children).length + imgOffset) return;
  
    // 🔹 Step 2: Clear existing refs before creating new ones
    expandableImgRefs.current = [];
  
    // 🔹 Step 3: Create new refs
    expandableImgRefs.current = Array(childrenArray.length + imgOffset)
      .fill(null)
      .map(() => createRef<HTMLImageElement>());
  
    const images = slider.current.querySelectorAll("img");
  
    images.forEach((img, index) => {
      img.setAttribute("data-index", index.toString());
      if (expandableImgRefs.current[index]) {
        expandableImgRefs.current[index].current = img;
      }
    });
  
    // 🔹 Step 4: Cleanup function to remove event listeners & reset refs
    return () => {
      expandableImgRefs.current = [];
    };
  
  }, [clonedChildren, visibleImages]);

  interface HTMLImageElementWithHandler extends HTMLImageElement {
    _pointerOverHandler?: EventListener;
  }

  useEffect(() => {
    thumbnailRefs.current.forEach((img: HTMLImageElement | null, i: number) => {
      if (img) {
        img.style.border =
          i === 0 ? '2px solid #2d2a26' : '0px solid transparent';
      }
    });
  }, []);
  
  useEffect(() => {
    const handlePointerOver = (index: number) => {
      thumbnailRefs.current.forEach((img: HTMLImageElement | null, i: number) => {
        if (img) {
          img.style.border =
            i === index ? '2px solid #2d2a26' : '0px solid transparent';
        }
      });
      selectedIndex.current = index;
      firstCellInSlide.current = slides.current[index].cells[0]?.element;
      const slideWidth = slider.current?.children[0]?.clientWidth || 0;
      x.current = -slideWidth * index;
      velocity.current = 0;
      positionSlider();
    };

    thumbnailRefs.current.forEach((img: HTMLImageElement | null, index: number) => {
      if (img) {
        const pointerOverHandler = () => handlePointerOver(index);
        img.addEventListener('pointerover', pointerOverHandler);
        (img as HTMLImageElementWithHandler)._pointerOverHandler = pointerOverHandler;
      }
    });

    return () => {
      thumbnailRefs.current.forEach((img: HTMLImageElement | null) => {
        if (img && (img as HTMLImageElementWithHandler)._pointerOverHandler) {
          img.removeEventListener('pointerover', (img as HTMLImageElementWithHandler)._pointerOverHandler!);
          delete (img as HTMLImageElementWithHandler)._pointerOverHandler;
        }
      });
    };
  }, []);

  const calculateVisibleImagesPerSlide = () => {
    if (firstChildWidth === 0 || !slider.current) return 1;
    const containerWidth = slider.current.clientWidth;
    return Math.max(1, Math.floor(containerWidth / firstChildWidth));
  };
  
  useEffect(() => {
    const imagesPerSlide = calculateVisibleImagesPerSlide();

    slides.current = [];

    const el = slider.current;
    if (!el || cells.current.length === 0) return;
  
    const containerRect = el.getBoundingClientRect();
    const contentWidth   = el.scrollWidth;              // total width of all cells
    const containerWidth = containerRect.width;         // visible width

    let newSlides: { cells: typeof cells.current; target: number }[] = [];

    const childrenArray = Children.toArray(children);
    const childCount = childrenArray.length;

    const startingIndex = visibleImages === 1 ? imagesPerSlide : imagesPerSlide + 1;

    if (childCount > visibleImages) {
      for (let i = startingIndex; i < clonedChildren.length - imagesPerSlide; i += imagesPerSlide) {
        const slice = cells.current.slice(i, i + imagesPerSlide);
    
        const firstRect = slice[0].element.getBoundingClientRect();
        const target = firstRect.left - containerRect.left;
    
        newSlides.push({ cells: slice, target });
      }
    } else if (!isWrapping.current) {
      for (let i = 0; i < clonedChildren.length; i++) {
        const slice = cells.current.slice(i, i + 1);
  
        // are we on the last slice?
        const isLast = i + 1 >= cells.current.length;
    
        let target: number;
        if (!isLast) {
          // normal case: align the first cell to the left edge
          const firstRect = slice[0].element.getBoundingClientRect();
          target = firstRect.left - containerRect.left;
        } else {
          // last slide: align end-of-content to right edge
          // i.e. maximum scroll offset = contentWidth - containerWidth
          target = contentWidth - containerWidth;
        }
    
        newSlides.push({ cells: slice, target });
      }
    } else {
      newSlides = [];
      slides.current = [];
      newSlides.push({ cells: cells.current, target: 0 });
    }
  
    slides.current = newSlides;
  }, [clonedChildren, visibleImages, firstChildWidth]);

  useEffect(() => {
    if (!slider.current || cells.current.length === 0 || hasPositioned.current || sliderWidth.current === 0 || !slides.current || !slides.current[0].cells[0]?.element) return;
    
    if (sliderWidth.current <= slider.current.clientWidth && !isWrapping.current) {
      firstCellInSlide.current = slides.current[0].cells[0]?.element;
      const containerWidth = slider.current.clientWidth;
      const cellWidth = cells.current[0].element.clientWidth;
      x.current = (containerWidth - cellWidth) / 2;
      positionSlider();
      hasPositioned.current = true;
      slider.current.style.opacity = '1';
    } else {
      slider.current.style.opacity = '1';
    }
    
  }, [slides.current]);

  useEffect(() => {
    if (firstChildWidth === 0 || visibleImages === 0 || !slider.current) return;
    let totalWidth = 0;
    const sliderChildren = Array.from(slider.current.children);

    const childrenArray = Children.toArray(children);
    const childCount = childrenArray.length;

    if (childCount > visibleImages) {
      for (let i = 0; i < sliderChildren.length - (visibleImages * 2); i++) {
        totalWidth += sliderChildren[i].getBoundingClientRect().width;
      }
    } else {
      for (let i = 0; i < sliderChildren.length; i++) {
        totalWidth += sliderChildren[i].getBoundingClientRect().width;
      }
    }
    
    sliderWidth.current = totalWidth;

  }, [clonedChildren, firstChildWidth, visibleImages]);

  interface PointerEvent extends MouseEvent {
    touches?: Array<{
      clientX: number
      clientY: number
    }>
  }

  function handlePointerStart(e: PointerEvent) {
    if (!slider.current) return;
    isClick.current = true;
    isScrolling.current = false;
    isPointerDown.current = true;

    const translateX = slider.current ? getCurrentXFromTransform(slider.current) : 0;

    dragStartPosition.current = translateX;
    dragX.current = translateX;

    if (typeof TouchEvent !== "undefined" && e instanceof TouchEvent && "touches" in e && e.touches.length > 0) {
      const touch = e.touches[0];
      startX.current = touch.clientX;
      startY.current = touch.clientY;
    } else if ("clientX" in e) {
      startX.current = e.clientX;
      startY.current = e.clientY;
    }
    
    startAnimation();
  };

  function startAnimation() {
    if (isAnimating.current) return;

    isAnimating.current = true;
    restingFrames.current = 0;
    animate();
  };

  function animate() {
    if (isScrolling.current === true || isClosing.current) {
      isAnimating.current = false;
      restingFrames.current = 0;
      isClosing.current = false;
      return;
    };
    applyDragForce();
    applySelectedAttraction();

    const previousX = x.current;

    integratePhysics();
    positionSlider();
    settle(previousX);

    if (isAnimating.current) requestAnimationFrame(() => animate());
  };

  function applyDragForce() {
    if (!isPointerDown.current) return;
  
    const dragVelocity = dragX.current - x.current;
    const dragForce = dragVelocity - velocity.current;
    applyForce(dragForce);
  };

  function applyForce(force: number) {
    velocity.current += force;
  };

  function integratePhysics() {
    x.current += velocity.current;
    velocity.current *= getFrictionFactor();
  };

  function getFrictionFactor() {
    return 1 - friction;
  }

  function positionSlider() {
    if (!slider.current) return;
    let currentPosition = x.current;
    if (sliderWidth.current >= slider.current.clientWidth && !isClick.current && isWrapping.current === true) {
      currentPosition = ((currentPosition % sliderWidth.current) + sliderWidth.current) % sliderWidth.current;
      currentPosition += -sliderWidth.current;
    }
    setTranslateX(currentPosition);
  };

  function settle(previousX: number) {
    const isResting = !isPointerDown.current && Math.abs(x.current - previousX) < 0.01 && Math.abs(velocity.current) < 0.01;

    if (isResting) {
      restingFrames.current++;
    } else {
      restingFrames.current = 0;
    }

    if (restingFrames.current > 2) {
      isAnimating.current = false;
      restingFrames.current = 0;

      if (!slider.current) return;
      positionSlider();
    }
  };

  function setTranslateX(x: number) {
    if (!slider.current) return;
    const translateX = getPositionValue(x);
    slider.current.style.transform = `translate3d(${translateX},0,0)`;
    const pct =
      sliderWidth.current > 0
        ? Math.abs(x) / sliderWidth.current * 100
        : 0
    if (progressFillRef.current) {
      progressFillRef.current.style.width = `${pct > 99 ? 0 : pct}%`
    }
  };

  function getPositionValue(position: number) {
    return Math.round(position) + 'px';
  };

  interface PointerMoveEvent extends MouseEvent {
    touches?: Array<{
      clientX: number
      clientY: number
    }>
  }  

  function handlePointerMove(e: PointerMoveEvent) {
    if (!slider.current) return;
    if (!isPointerDown.current) return;
    e.preventDefault();

    previousDragX.current = dragX.current;

    let currentX: number = 0, currentY: number = 0;

    if (typeof TouchEvent !== "undefined" && e instanceof TouchEvent && "touches" in e && e.touches.length > 0) {
      const touch = (e as TouchEvent).touches[0];
      currentX = touch.clientX;
      currentY = touch.clientY;
    } else if ("clientX" in e) { 
      currentX = e.clientX;
      currentY = e.clientY;
    }

    const moveX = currentX - startX.current;
    const moveY = currentY - startY.current;

    dragX.current = dragStartPosition.current + moveX;

    if (sliderWidth.current <= slider.current.clientWidth || !isWrapping.current) {
      const originBound = Math.max(0, dragStartPosition.current);

      if (dragX.current > originBound) {
        dragX.current = (dragX.current + originBound) * 0.5;
      }

      const lastSlide = sliderWidth.current <= slider.current.clientWidth ? (slides.current.length - visibleImages) * cells.current[0].element.offsetWidth : slides.current[slides.current.length - 1].target;
      const endBound = Math.min(-lastSlide, dragStartPosition.current);

      if (dragX.current < endBound) {
        dragX.current = (dragX.current + endBound) * 0.5;
      }
    }

    if (Math.abs(moveX) > 1 || Math.abs(moveY) > 1) {
      isClick.current = false;
    }

    dragMoveTime.current = new Date();
  };
  
  type PointerEndEvent = MouseEvent

  function handlePointerEnd(e: PointerEndEvent) {
    if (!slider.current) return;
    if (!isPointerDown.current) return;
    isPointerDown.current = false;

    if (sliderWidth.current <= slider.current.clientWidth) {
      select(0);
    }

    let index = dragEndRestingSelect();

    if (isClick.current) {
      console.log('clicked');
      isClosing.current = true;
      const targetImg = (e.target as HTMLElement).closest("img") as HTMLImageElement | null;
      if (!targetImg) return;
      const imgIndex = targetImg.dataset.index;
      if (imgIndex === undefined) return;
      setShowFullscreenModal(true);
      const parsedImgIndex = parseInt(imgIndex)
      const originalIndex = ((parsedImgIndex - visibleImagesRef.current) % imageCount + imageCount) % imageCount;
      const fullscreenIndex = originalIndex + 1;
      const finalIndex = !isWrapping.current ? parsedImgIndex : fullscreenIndex;
      toggleFullscreen(e as unknown as React.PointerEvent<HTMLDivElement>, expandableImgRefs.current[parsedImgIndex], finalIndex);
      setSlideIndex(finalIndex);
    } else {
      console.log('dragged');
      if (visibleImagesRef.current === 1 && (index === selectedIndex.current || (index === slides.current.length && selectedIndex.current !== slides.current.length - 1))) {
        index += dragEndBoostSelect();
      } else if (visibleImagesRef.current > 1 && (index === selectedIndex.current || (index === slides.current.length - 1 && selectedIndex.current !== slides.current.length - 2))) {
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

    const index = selectedIndex.current >= slides.current.length - 1 && slides.current[slides.current.length - 1].target === sliderWidth.current ? 0 : selectedIndex.current;

    let distance = -slides.current[index].target - x.current;

    const containerWidth = slider.current.clientWidth;
    const cellWidth = cells.current[0].element.clientWidth;

    const childrenArray = Children.toArray(children);
    const childCount = childrenArray.length;

    const slideWidth = cellWidth * childCount;

    if (sliderWidth.current <= slider.current.clientWidth) {
      distance = (containerWidth - slideWidth) / 2 - x.current;
    }
    const force = distance * attraction;
    applyForce(force);
  }

  function dragEndRestingSelect() {
    const restingX = getRestingPosition();

    const distance = Math.abs(getSlideDistance(-restingX, selectedIndex.current) ?? Infinity);

    const positiveResting = getClosestResting(restingX, distance, 1);
    const negativeResting = getClosestResting(restingX, distance, -1);
    
    return positiveResting.distance < negativeResting.distance ?
      positiveResting.index : negativeResting.index;
  };

  function getRestingPosition() {
    return x.current + velocity.current / (1 - getFrictionFactor());
  };

  function getSlideDistance(x: number, index: number) {
    if (!slider.current) return 1;
    const length = (slides.current[slides.current.length - 1].target === sliderWidth.current || window.innerWidth <= 664) ? slides.current.length - 1 : slides.current.length;
    const slideIndex = ((index % length) + length) % length;
    const finalIndex = isWrapping.current === true ? slideIndex : index;
    const slide = slides.current[finalIndex];
    if (!slide) return null;
    let wrap = sliderWidth.current * Math.floor(index/length);
    if (sliderWidth.current <= slider.current.clientWidth || !isWrapping.current) {
      wrap = 0;
    }

    return x - (slide.target + wrap);
  };

  function getClosestResting(restingX: number, distance: number, increment: number) {
    let index = selectedIndex.current;
    let minDistance = Infinity;
  
    while (distance < minDistance) {
      index += increment;
      minDistance = distance;
      distance = getSlideDistance(-restingX, index) ?? Infinity;
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
    select(selectedIndex.current - 1);
  };

  function next() {
    isScrolling.current = false;
    select(selectedIndex.current + 1);
  };

  function select(index: number) {
    if (!slider.current) return;
    if (sliderWidth.current > slider.current.clientWidth && isWrapping.current === true) {
      wrapSelect(index);
    }
    const containedIndex = index < 0 ? 0 : index > slides.current.length - 1 ? slides.current.length - 1 : index;
    const length = (slides.current[slides.current.length - 1].target === sliderWidth.current || window.innerWidth <= 664) ? slides.current.length - 1 : slides.current.length;
    index = ((index % length) + length) % length;
    const finalIndex = isWrapping.current === true ? index : containedIndex;
    selectedIndex.current = finalIndex;
    firstCellInSlide.current = slides.current[finalIndex].cells[0]?.element;
    startAnimation();
    thumbnailRefs.current.forEach((img: HTMLImageElement | null, i: number) => {
      if (img) {
        img.style.border =
          i === index ? '2px solid #2d2a26' : '0px solid transparent';
      }
    });
    if (!simpleBarRef.current) return;
    const simpleBarScrollElement = simpleBarRef.current.getScrollElement() as HTMLElement;
    if (!simpleBarScrollElement) return;
    const container = thumbnailContainerRef.current;
    const containerHeight = simpleBarScrollElement.offsetHeight;
    if (!container) return;
    const numThumbnails = container.children.length;
    const logicalIndex = ((index % numThumbnails) + numThumbnails) % numThumbnails;
    
    const thumbnail = container.children[logicalIndex] as HTMLElement;
    if (!thumbnail) return;

    const thumbnailTop = thumbnail.offsetTop;
    const thumbnailBottom = thumbnailTop + thumbnail.offsetHeight;

    simpleBarScrollElement.style.scrollBehavior = "smooth";

    const timeout = setTimeout(() => {
      simpleBarScrollElement.style.scrollBehavior = "";
    }, 1000);

    if (windowSize.width > 664) {
      if (
        thumbnailTop < simpleBarScrollElement.scrollTop ||
        thumbnailBottom > simpleBarScrollElement.scrollTop + containerHeight
      ) {
        simpleBarScrollElement.scrollTop =
          thumbnailTop - containerHeight / 2 + thumbnail.offsetHeight / 2;
      }
    } else {
      // ─── HORIZONTAL CENTERING ─────────────────────────────
      const cw = simpleBarScrollElement.clientWidth;
      const left  = thumbnail.offsetLeft;
      const right = left + thumbnail.offsetWidth;
      const cur   = simpleBarScrollElement.scrollLeft;

      // if out‐of‐view → center it
      if (left < cur || right > cur + cw) {
        const target = left - (cw - thumbnail.offsetWidth) / 2;
        simpleBarScrollElement.scrollLeft = Math.max(0, target);
      }
    }

    return () => clearTimeout(timeout);
  };

  function getTranslateX(element: HTMLElement): number {
    const style = window.getComputedStyle(element);
    const matrix = new DOMMatrix(style.transform);
    return matrix.m41 || 0;
  }

  useEffect(() => {
    if (!slider.current || !firstCellInSlide.current || cells.current.length === 0) return;
    lastTranslateX.current = getTranslateX(firstCellInSlide.current);
    const diff = lastTranslateX.current - Math.abs(x.current);
    const containerWidth = slider.current.clientWidth;
    const cellWidth = cells.current[0].element.clientWidth;
    const childrenArray = Children.toArray(children);
    const childCount = childrenArray.length;

    const slideWidth = cellWidth * childCount;
    
    if (sliderWidth.current < slider.current.clientWidth) {
      x.current = 0;
      selectedIndex.current = 0;
      const currentPosition = x.current + (containerWidth - slideWidth) / 2;
      setTranslateX(currentPosition);
    } else {
      if (selectedIndex.current === 0) {
        x.current = 0;
        const currentPosition = x.current;
        setTranslateX(currentPosition);
      } else {
        x.current -= diff;
        const currentPosition = x.current;
        setTranslateX(currentPosition);
        const index = Math.floor(Math.abs(currentPosition) / (sliderWidth.current / slides.current.length));
        selectedIndex.current = index;
      }
    }
    
  }, [windowSize, clonedChildren, visibleImages, firstChildWidth]);

  function wrapSelect(index: number) {
    if (!slider.current) return;

    const length = slides.current[slides.current.length - 1].target === sliderWidth.current || window.innerWidth <= 664 ? slides.current.length - 1 : slides.current.length;
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

  interface WheelEvent extends Event {
    deltaX: number;
    deltaY: number;
  }

  function handleWheel(e: WheelEvent) {
    if (!slider.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      const scroller = document.scrollingElement!; 
      scroller.scrollTop += e.deltaY;
      return;
    }
    if (sliderWidth.current <= slider.current.clientWidth) {
      return;
    }
    const isHorizontalScroll = Math.abs(e.deltaX) > Math.abs(e.deltaY);

    if (isHorizontalScroll) {
      isScrolling.current = true;
      e.preventDefault();
  
      let translateX = getCurrentXFromTransform(slider.current);
      translateX -= e.deltaX;
  
      let currentPosition = translateX;

      if (isWrapping.current === true) {
        currentPosition = ((translateX % sliderWidth.current) + sliderWidth.current) % sliderWidth.current;
        currentPosition += -sliderWidth.current;
      } else {
        const containerWidth = slider.current.clientWidth;
        const contentWidth   = slider.current.scrollWidth;
      
        const maxTranslateX = 0;

        const minTranslateX = containerWidth - contentWidth;
      
        currentPosition = Math.max(minTranslateX, Math.min(maxTranslateX, translateX));
      }
      
      setTranslateX(currentPosition);
  
      const index = Math.round(Math.abs(currentPosition) / (sliderWidth.current / slides.current.length));
      selectedIndex.current = index;
      
      thumbnailRefs.current.forEach((img: HTMLImageElement | null, i: number) => {
        if (img) {
          img.style.border =
            (i === index) || (i === 0 && index === slides.current.length - 1) || (i === 0 && index === slides.current.length) ? '2px solid #2d2a26' : '0px solid transparent';
        }
      });
      if (!simpleBarRef.current) return;
      const simpleBarScrollElement = simpleBarRef.current.getScrollElement() as HTMLElement;
      if (!simpleBarScrollElement) return;
      const container = thumbnailContainerRef.current;
      const containerHeight = simpleBarScrollElement.offsetHeight;
      if (!container) return;
      const numThumbnails = container.children.length;
      const logicalIndex = ((index % numThumbnails) + numThumbnails) % numThumbnails;
      
      const thumbnail = container.children[logicalIndex] as HTMLElement;
      if (!thumbnail) return;
  
      const thumbnailTop = thumbnail.offsetTop;
      const thumbnailBottom = thumbnailTop + thumbnail.offsetHeight;
  
      simpleBarScrollElement.style.scrollBehavior = "smooth";
  
      const timeout = setTimeout(() => {
        simpleBarScrollElement.style.scrollBehavior = "";
      }, 1000);
  
      if (windowSize.width > 664) {
        if (
          thumbnailTop < simpleBarScrollElement.scrollTop ||
          thumbnailBottom > simpleBarScrollElement.scrollTop + containerHeight
        ) {
          simpleBarScrollElement.scrollTop =
            thumbnailTop - containerHeight / 2 + thumbnail.offsetHeight / 2;
        }
      } else {
        // ─── HORIZONTAL CENTERING ─────────────────────────────
        const cw = simpleBarScrollElement.clientWidth;
        const left  = thumbnail.offsetLeft;
        const right = left + thumbnail.offsetWidth;
        const cur   = simpleBarScrollElement.scrollLeft;

        // if out‐of‐view → center it
        if (left < cur || right > cur + cw) {
          const target = left - (cw - thumbnail.offsetWidth) / 2;
          simpleBarScrollElement.scrollLeft = Math.max(0, target);
        }
      }
      x.current = currentPosition
      firstCellInSlide.current = slides.current[index].cells[0]?.element;
      return () => clearTimeout(timeout);
    } else {
      isScrolling.current = false;
    }
  };

  useEffect(() => {
    const sliderRef = slider.current;
  
    if (sliderRef) {
      sliderRef.addEventListener("pointerdown", handlePointerStart);
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", (e) => handlePointerEnd(e));
      sliderRef.addEventListener("wheel", handleWheel, { passive: false });

      return () => {
        sliderRef.removeEventListener("pointerdown", handlePointerStart);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerEnd);
        sliderRef.removeEventListener("wheel", handleWheel);
      };
    };
  }, [handlePointerStart, handlePointerMove, handlePointerEnd, handleWheel, slider.current, isScrolling.current]);

  const [fullscreenImg, setFullscreenImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    function updateFullscreenPosition() {
      if (fullscreenImg) {
        const newPos = fullscreenImg.getBoundingClientRect();
        if (selectedIndex.current === 0) {
          newPos.x -= sliderWidth.current;
        }
        setFullscreenPosition(newPos);
      }
    }
    window.addEventListener("resize", updateFullscreenPosition);
    return () => window.removeEventListener("resize", updateFullscreenPosition);
  }, [fullscreenImg]);  

  function toggleFullscreen(e: React.PointerEvent<HTMLDivElement>, img: RefObject<HTMLImageElement | null>, index: number) {
    if (!img.current) return;

    const target = e.target as HTMLImageElement;
    const position = target.getBoundingClientRect();

    setFullscreenPosition(position);
    setFullscreenImg(target);

    const overlayDiv = document.createElement('div');
    overlayDivRef.current = overlayDiv;

    const duplicateImg = new Image();
    duplicateImg.src = img.current.src;
    duplicateImg.className = 'duplicateImg';
    Object.assign(duplicateImg.style, {
      width: img.current.offsetWidth + 'px',
      height: img.current.offsetHeight + 'px',
      position: "absolute",
      left: position.left + 'px',
      top: position.top + 'px',
      transition: "all 0.3s cubic-bezier(.4,0,.22,1)",
      zIndex: 9998
    });

    Object.assign(overlayDiv.style, {
      transition: "background-color 0.3s cubic-bezier(.4,0,.22,1)",
      position: "fixed",
      inset: "0",
      backgroundColor: "transparent",
      zIndex: 8999
    });

    const closeButton = document.createElement('button');
    closeButton.type = "button";
    closeButton.className = 'close-button'
    Object.assign(closeButton.style, {
      position: "absolute",
      top: "12px",
      right: "12px",
      minWidth: '0px',
      padding: '0px',
      opacity: "0",
      transition: "opacity 0.3s cubic-bezier(.4,0,.22,1)",
      zIndex: 9999,
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer'
    });

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "35px");
    svg.setAttribute("height", "35px");
    svg.setAttribute("viewBox", "0 0 16 16");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", "white");
    path.setAttribute("stroke", "#4f4f4f");
    path.setAttribute("stroke-width", "0.5");
    path.setAttribute("d", "M12.96 4.46l-1.42-1.42-3.54 3.55-3.54-3.55-1.42 1.42 3.55 3.54-3.55 3.54 1.42 1.42 3.54-3.55 3.54 3.55 1.42-1.42-3.55-3.54 3.55-3.54z");

    const chevronStyles = {
      height: "50px",
      width: "50px",
      position: "absolute",
      top: "45.5%",
      zIndex: 9999,
      cursor: "pointer",
      transition: "opacity 0.3s cubic-bezier(.4,0,.22,1)",
      opacity: "0",
      display: imageCount > 1 ? "block" : "none"
    };

    const leftChevron = document.createElement("div");
    leftChevron.className = "left-chevron";
    Object.assign(leftChevron.style, chevronStyles, { left: "0", transform: "rotate(180deg)" });

    const rightChevron = document.createElement("div");
    rightChevron.className = "right-chevron";
    Object.assign(rightChevron.style, chevronStyles, { right: "0" });

    const chevronSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    chevronSvg.setAttribute("width", "50px");
    chevronSvg.setAttribute("height", "50px");
    chevronSvg.setAttribute("fill", "white");
    chevronSvg.setAttribute("viewBox", "0 0 16 16");

    const chevronPolygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    chevronPolygon.setAttribute("stroke", "#4f4f4f");
    chevronPolygon.setAttribute("stroke-width", "0.5");
    chevronPolygon.setAttribute("points", "4.586,3.414 9.172,8 4.586,12.586 6,14 12,8 6,2");

    const counter = document.createElement('div');
    counter.className = 'counter';
    Object.assign(counter.style, {
      position: "absolute",
      top: "0",
      left: "0",
      color: "white",
      zIndex: 9999,
      userSelect: "none",
      height: "32px",
      marginTop: "15px",
      marginLeft: "16px",
      fontSize: "14px",
      lineHeight: "32px",
      transition: "opacity 0.3s cubic-bezier(.4,0,.22,1)",
      opacity: "0",
      fontFamily: "Roboto, sans-serif",
      textShadow: "1px 1px 3px #4f4f4f",
      display: imageCount > 1 ? "block" : "none"
    });
    counter.textContent = `${index} / ${imageCount}`;

    svg.appendChild(path);
    closeButton.appendChild(svg);
    chevronSvg.appendChild(chevronPolygon);
    leftChevron.appendChild(chevronSvg.cloneNode(true));
    rightChevron.appendChild(chevronSvg);

    document.body.appendChild(counter);
    document.body.appendChild(leftChevron);
    document.body.appendChild(rightChevron);
    document.body.appendChild(duplicateImg);
    document.body.appendChild(overlayDiv);
    document.body.appendChild(closeButton);

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    overlayDiv.offsetWidth;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    duplicateImg.offsetWidth;

    Object.assign(duplicateImg.style, {
      position: "fixed",
      inset: "0",
      width: "100%",
      height: "100dvh",
      objectFit: "contain",
      zIndex: 9998
    });

    Object.assign(overlayDiv.style, {
      position: "fixed",
      inset: "0",
      backgroundColor: "rgba(0,0,0,0.8)",
      zIndex: 8999
    });

    closeButton.style.opacity = "1";
    leftChevron.style.opacity = "1";
    rightChevron.style.opacity = "1";
    counter.style.opacity = "1";

    duplicateImg.addEventListener('transitionend', function onEnd() {
      setShowFullscreenSlider(true);
    }, { once: true });
  }

  useLayoutEffect(() => {
    if (!showFullscreenSlider) return;
    const duplicateImg = document.querySelector('.duplicateImg');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.removeChild(duplicateImg!);
      })
    })
  }, [showFullscreenSlider]);

  const FlickityArrow = ({ direction }: { direction: "prev" | "next" }) => (
    <SvgIcon viewBox="0 0 24 24">
      {direction === "prev" ? (
        <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z" />
      ) : (
        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
      )}
    </SvgIcon>
  );

  const VERT_ANGLE_MIN =  60;
  const VERT_ANGLE_MAX = 120;

  function onTouchStart(e: TouchEvent) {
    if (e.touches.length !== 1) return;
    document.body.style.overflowY = 'auto';
    const t0 = e.touches[0];
    startX.current = t0.clientX;
    startY.current = t0.clientY;
  }

  function onTouchMove(e: TouchEvent) {
    if (e.touches.length !== 1) return;    
    const t0 = e.touches[0];
    const dx = t0.clientX - startX.current;
    const dy = t0.clientY - startY.current;

    const angle = Math.abs(Math.atan2(dy, dx) * (180 / Math.PI));
      // vertical if within [60°,120°]
    const isVerticalScroll = angle >= VERT_ANGLE_MIN && angle <= VERT_ANGLE_MAX;

    if (isVerticalScroll) {
      // vertical → handle scroll
      document.body.style.overflowY = 'auto';

    } else {
      // horizontal → let your slider logic run (no preventDefault)
      e.preventDefault();
      document.body.style.overflowY = 'hidden';
    }
  }

  function onTouchEnd() {
    document.body.style.overflowY = 'auto';
  }

  useEffect(() => {
    const el = slider.current!
    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchmove',  onTouchMove,  { passive: false })
    el.addEventListener('touchend',   onTouchEnd)
    el.addEventListener('touchcancel',onTouchEnd)
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove',  onTouchMove)
      el.removeEventListener('touchend',   onTouchEnd)
      el.removeEventListener('touchcancel',onTouchEnd)
    }
  }, []);
  

  return (
    <Box sx={{ position: 'relative', height: imageCount > 2 ? '506px' : '500px', '@media (max-width: 664px)': { height: imageCount > 2 ? 'calc(67vw + 6px)' : '67vw' }, backgroundColor: '#f8f9fa', zIndex: 1 }}>
    {/* Previous Button */}
    <IconButton
      onClick={() => previous()}
      sx={{
        position: "absolute",
        display: imageCount > 1 && slider.current && sliderWidth.current > slider.current.clientWidth ? 'flex' : 'none',
        left: 10,
        top: "50%",
        transform: "translateY(-50%)",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        boxShadow: 2,
        zIndex: 2,
        "&:hover": { backgroundColor: "rgba(255, 255, 255, 1)" },
      }}
    >
      <FlickityArrow direction="prev" />
    </IconButton>

      {/* Next Button */}
      <IconButton
        onClick={() => next()}
        sx={{
          position: "absolute",
          display: imageCount > 1 && slider.current && sliderWidth.current > slider.current.clientWidth ? 'flex' : 'none',
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          boxShadow: 2,
          zIndex: 2,
          "&:hover": { backgroundColor: "rgba(255, 255, 255, 1)" },
        }}
      >
        <FlickityArrow direction="next" />
      </IconButton>
      {/* Slider */}
      <Box 
        ref={slider}
        sx={{ 
          overflow: "visible",
          position: 'absolute',
          left: 0,
          width: '100%',
          height: '100%',
          cursor: 'grab',
          opacity: 0,
          willChange: 'opacity'
        }}
      >
        {clonedChildren}
      </Box>
      {/* progress track */}
      <Box
        sx={{
          position: 'absolute',
          display: imageCount > 2 ? 'block' : 'none',
          bottom: 0,
          left: 0,
          width: '100%',
          height: 6,
          bgcolor: 'grey.300',
        }}
      >
        {/* progress fill */}
        <Box
          component="span"
          ref={progressFillRef}
          sx={{
            display: 'block',
            height: '100%',
            width: '0%',            // start at 0
            bgcolor: '#2d2a26',
            transition: 'width 0.2s ease-out',
          }}
        />
      </Box>
    </Box>
  );
};

export default ProductImageSlider;