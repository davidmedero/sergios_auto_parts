/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useRef, useEffect, ReactNode, cloneElement, Children, useState, ReactElement, HTMLAttributes, ClassAttributes } from "react";
import { Box, IconButton, SvgIcon } from "@mui/material";

interface HeroSliderProps {
  children: ReactNode;
  windowSize: { width: number; height: number };
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
  cells: React.MutableRefObject<
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

const HeroSlider = ({
  children,
  windowSize
}: HeroSliderProps) => {
  const slider = useRef<HTMLDivElement | null>(null);
  const [firstChildWidth, setFirstChildWidth] = useState(0);
  const [sliderHeight, setSliderHeight] = useState(0);
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
  const [visibleImages, setVisibleImages] = useState(0);
  const friction = 0.28;
  const attraction = 0.025;
  const isClick = useRef(false);
  const visibleImagesRef = useRef(0);
  const firstCellInSlide = useRef<HTMLElement | null>(null);
  const cells = useRef<{ element: HTMLElement, index: number }[]>([]);
  const slides = useRef<{ cells: { element: HTMLElement }[] }[]>([]);
  const isDragSelect = useRef<boolean>(false);
  const lastTranslateX = useRef<number>(0);
  const [slidesState, setSlidesState] = useState<{ cells: { element: HTMLElement }[] }[]>([]);
  const [selectedIndexState, setSelectedIndexState] = useState<number>(0);
  const hasPositioned = useRef<boolean>(false);


  useEffect(() => {
    if (!cells.current?.[0]?.element) return;
    
    const updateWidth = () => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (!cells.current) return;
          const width = cells.current[0]?.element.clientWidth;

          if (width > 0 && width !== firstChildWidth) {
            setFirstChildWidth(width);
          }
        }, 50);
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
  
    const images = calculateVisibleImages();
    const childrenArray = Children.toArray(children);
    const childCount = childrenArray.length;
  
    setVisibleImages(images);
    visibleImagesRef.current = images;
  
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
    if (!slider.current || cells.current.length === 0 || hasPositioned.current || sliderWidth.current === 0 || !slides.current || !slides.current[0].cells[0]?.element) return;
    firstCellInSlide.current = slides.current[0].cells[0]?.element;
    const containerWidth = slider.current.clientWidth;
    const cellWidth = cells.current[0].element.clientWidth;
    x.current = (containerWidth - cellWidth) / 2;
    positionSlider();
    hasPositioned.current = true;
    slider.current.style.opacity = '1';
  }, [slides.current]);
  
  useEffect(() => {
    slides.current = [];
  
    for (let i = visibleImages; i < clonedChildren.length - visibleImages; i++) {
      slides.current.push({
        cells: [cells.current[i]],
      });
    }

    setSlidesState(slides.current);
  }, [clonedChildren, windowSize, visibleImages, firstChildWidth]);

  useEffect(() => {
    if (firstChildWidth === 0 || visibleImages === 0 || !slider.current) return;
    let totalWidth = 0;
    const sliderChildren = Array.from(slider.current.children);

    for (let i = 0; i < sliderChildren.length - (visibleImages * 2); i++) {
      totalWidth += sliderChildren[i].getBoundingClientRect().width;
    }

    sliderWidth.current = totalWidth;

  }, [windowSize, clonedChildren, firstChildWidth, visibleImages]);

  interface PointerEvent extends MouseEvent {
    touches?: { clientX: number }[];
  }

  function handlePointerStart(e: PointerEvent) {
    if(!slider.current) return;
    isClick.current = true;
    isScrolling.current = false;
    isPointerDown.current = true;

    slider.current.style.cursor = 'grabbing';

    const translateX = slider.current ? getCurrentXFromTransform(slider.current) : 0;

    dragStartPosition.current = translateX;
    dragX.current = translateX;

    if (e.touches && e.touches.length > 0) {
      startX.current = e.touches[0].clientX;
    } else {
      startX.current = e.clientX;
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
    if (isScrolling.current === true) {
      isAnimating.current = false;
      restingFrames.current = 0;
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
    let currentPosition = x.current;
    currentPosition = ((currentPosition % sliderWidth.current) + sliderWidth.current) % sliderWidth.current;
    currentPosition += -sliderWidth.current;
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
  };

  function getPositionValue(position: number) {
    return Math.round(position) + 'px';
  };

  interface PointerMoveEvent extends MouseEvent {
    touches?: { clientX: number }[];
  }

  function handlePointerMove(e: PointerMoveEvent) {
    if (!isPointerDown.current) return;
    e.preventDefault();

    previousDragX.current = dragX.current;

    let currentX: number;

    if (e.touches && e.touches.length > 0) {
      currentX = e.touches[0].clientX;
    } else {
      currentX = e.clientX;
    }

    const moveX = currentX - startX.current;

    dragX.current = dragStartPosition.current + moveX;

    if (Math.abs(moveX) > 1) {
      isClick.current = false;
    }

    dragMoveTime.current = new Date();
  };

  function handlePointerEnd() {
    if (!isPointerDown.current || !slider.current) return;
    isPointerDown.current = false;

    slider.current.style.cursor = 'grab';

    let index = dragEndRestingSelect();

    const delta = previousDragX.current - dragX.current;

    if (Math.abs(delta) === 0 || isClick.current) {
      console.log('clicked');
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

    const containerWidth = slider.current.clientWidth;
    const cellWidth = cells.current[0].element.clientWidth;

    const cell = cellWidth * selectedIndex.current;

    // ✅ Adjust position to center the cell
    const centeredPosition = -cell + (containerWidth - cellWidth) / 2; 

    const distance = centeredPosition - x.current;
    const force = distance * attraction;
    applyForce(force);
  }

  function dragEndRestingSelect() {
    const restingX = getRestingPosition();

    const distance = Math.abs(getSlideDistance(-restingX, selectedIndex.current));

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
    const length = slides.current.length;
    const containerWidth = slider.current.clientWidth; 
    const cellWidth = cells.current[0].element.clientWidth;
    const cellIndex = ((index % length) + length) % length;
    const cell = cellWidth * cellIndex;
    // ✅ Adjust cell distance calculation to be centered
    const centeredCell = cell - (containerWidth - cellWidth) / 2;
    const wrap = sliderWidth.current * Math.floor(index/length)

    return x - (centeredCell + wrap);
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
    select(selectedIndex.current - 1);
  };

  function next() {
    isScrolling.current = false;
    select(selectedIndex.current + 1);
  };

  function select(index: number) {
    wrapSelect(index);
    const length = slides.current.length;
    index = ((index % length) + length) % length;
    selectedIndex.current = index;
    setSelectedIndexState(index);
    firstCellInSlide.current = slides.current[index].cells[0]?.element;
    startAnimation();
  };

  function getTranslateX(element: HTMLElement): number {
    const style = window.getComputedStyle(element);
    const matrix = new DOMMatrix(style.transform);
    return matrix.m41 || 0;
  }

  useEffect(() => {
    if (!slider.current || !firstCellInSlide.current || cells.current.length === 0) return;
    const containerWidth = slider.current.clientWidth;
    const cellWidth = cells.current[0].element.clientWidth;
    lastTranslateX.current = getTranslateX(firstCellInSlide.current);
    const diff = lastTranslateX.current - Math.abs(x.current);
    if (selectedIndex.current === 0) {
      x.current = (containerWidth - cellWidth) / 2;
      positionSlider();
    } else {
      x.current -= diff;
      const currentPosition = x.current + (containerWidth - cellWidth) / 2;
      setTranslateX(currentPosition);
      const index = Math.round(Math.abs(currentPosition) / (sliderWidth.current / slides.current.length));
      selectedIndex.current = index;
    }
  }, [windowSize, visibleImages, clonedChildren, firstChildWidth]);

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
    const isHorizontalScroll = Math.abs(e.deltaX) > Math.abs(e.deltaY);

    if (isHorizontalScroll) {
      e.preventDefault();
      isScrolling.current = true;
  
      let translateX = getCurrentXFromTransform(slider.current);
      translateX -= e.deltaX;
  
      let currentPosition = ((translateX % sliderWidth.current) + sliderWidth.current) % sliderWidth.current;
      currentPosition += -sliderWidth.current;
      setTranslateX(currentPosition);
  
      const index = Math.round(Math.abs(currentPosition) / (sliderWidth.current / slides.current.length));
      selectedIndex.current = index;
      
      const wrappedIndex = ((index % slides.current.length) + slides.current.length) % slides.current.length;
      setSelectedIndexState(wrappedIndex);
      x.current = currentPosition;
      firstCellInSlide.current = slides.current[wrappedIndex].cells[0]?.element;
    } else {
      isScrolling.current = false;
    }
  };

  useEffect(() => {
    const sliderRef = slider.current;
  
    if (sliderRef) {
      sliderRef.addEventListener("pointerdown", handlePointerStart);
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", () => handlePointerEnd());
      sliderRef.addEventListener("wheel", handleWheel, { passive: false });

      return () => {
        sliderRef.removeEventListener("pointerdown", handlePointerStart);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerEnd);
        sliderRef.removeEventListener("wheel", handleWheel);
      };
    };
  }, [handlePointerStart, handlePointerMove, handlePointerEnd, handleWheel, slider.current, isScrolling.current]);

  const FlickityArrow = ({ direction }: { direction: "prev" | "next" }) => (
    <SvgIcon viewBox="0 0 24 24">
      {direction === "prev" ? (
        <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z" />
      ) : (
        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
      )}
    </SvgIcon>
  );

  useEffect(() => {
    const el = slider.current;
    if (!el) return;

    const ro = new ResizeObserver(entries => {
      let max = 0;
      for (const ent of entries) {
        max = Math.max(max, ent.contentRect.height);
      }
      setSliderHeight(max)
    });

    Array.from(el.children).forEach(child => {
      ro.observe(child as Element);
    });

    return () => ro.disconnect();
  }, [clonedChildren]);

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
    <Box sx={{ position: 'relative', height: `${sliderHeight}px`, overflow: "hidden" }}>
    {/* Previous Button */}
    <IconButton
      onClick={() => previous()}
      sx={{
        position: "absolute",
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
          transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'opacity'
        }}
      >
        {clonedChildren}
      </Box>
      {/* Pagination Dots */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          position: "absolute",
          bottom: 5,
          width: "100%",
          zIndex: 10
        }}
      >
        {Array.from({ length: slidesState.length }).map(
          (_, index) => (
            <Box
              key={index}
              onClick={() => {
                isScrolling.current = false;
                select(index)
              }}
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor:
                  selectedIndexState === index ? "black" : "lightgray",
                margin: "10px 5px 5px 5px",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
              }}
            />
          )
        )}
      </Box>
    </Box>
  );
};

export default HeroSlider;