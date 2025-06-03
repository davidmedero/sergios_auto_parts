import * as React from "react";
import { NumberField } from "@base-ui-components/react";
import styles from "./NumberField.module.css";
import { useRipple } from "../hooks/useRippleHook";

export interface NumberFieldProps {
  value: number;
  handleChange: (value: number | null) => void;
}

export default function NumberFieldForProductInfoPage({ value, handleChange }: NumberFieldProps) {
  const id = React.useId();

  const decrementRipple = useRipple();
  const incrementRipple = useRipple();

  return (
    <NumberField.Root
      id={id}
      defaultValue={1}
      min={1}
      max={10}
      className={styles.Field}
      onValueChange={(value) => handleChange(value)}
      value={value}
    >
      <NumberField.ScrubArea className={styles.ScrubArea}>
        <label htmlFor={id} className={styles.Label}>
          Quantity
        </label>
        <NumberField.ScrubAreaCursor className={styles.ScrubAreaCursor}>
          <CursorGrowIcon />
        </NumberField.ScrubAreaCursor>
      </NumberField.ScrubArea>

      <NumberField.Group className={styles.Group}>
        <NumberField.Decrement 
          type="button" 
          className={styles.Decrement} 
          ref={decrementRipple.ref}
          onPointerDown={decrementRipple.onPointerDown}>
          <MinusIcon />
        </NumberField.Decrement>

        <NumberField.Input className={styles.Input} style={{ borderRadius: 0 }} />

        <NumberField.Increment 
          type="button" 
          className={styles.Increment} 
          ref={incrementRipple.ref}
          onPointerDown={incrementRipple.onPointerDown}>
          <PlusIcon />
        </NumberField.Increment>
      </NumberField.Group>
    </NumberField.Root>
  );
}

function CursorGrowIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      width="26"
      height="14"
      viewBox="0 0 24 14"
      fill="black"
      stroke="white"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M19.5 5.5L6.49737 5.51844V2L1 6.9999L6.5 12L6.49737 8.5L19.5 8.5V12L25 6.9999L19.5 2V5.5Z" />
    </svg>
  );
}

function PlusIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentcolor"
      strokeWidth="1.6"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M0 5H5M10 5H5M5 5V0M5 5V10" />
    </svg>
  );
}

function MinusIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentcolor"
      strokeWidth="1.6"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M0 5H10" />
    </svg>
  );
}