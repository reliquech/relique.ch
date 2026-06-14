/**
 * Buttons - RELIQUE Button System
 * 
 * Hệ thống button có tổ chức với nhiều variants,
 * tất cả wrapper từ shadcn button gốc với framer-motion animations.
 * 
 * @packageDocumentation
 */

// Base button wrapper
export { BaseButton } from "./base-button";
export type { BaseButtonProps } from "./base-button";

// Primary CTA button
export { PrimaryButton } from "./primary-button";
export type { PrimaryButtonProps } from "./primary-button";

// Secondary button
export { SecondaryButton } from "./secondary-button";
export type { SecondaryButtonProps } from "./secondary-button";

// Alert/Destructive button
export { AlertButton } from "./alert-button";
export type { AlertButtonProps } from "./alert-button";

// Navy button (brand color)
export { NavyButton } from "./navy-button";
export type { NavyButtonProps } from "./navy-button";

// Outline button
export { OutlineButton } from "./outline-button";
export type { OutlineButtonProps } from "./outline-button";

// Ghost button
export { GhostButton } from "./ghost-button";
export type { GhostButtonProps } from "./ghost-button";

// Link button
export { LinkButton } from "./link-button";
export type { LinkButtonProps } from "./link-button";

// Liquid button (animated fill)
export { LiquidButton } from "./liquid-button";
export type { LiquidButtonProps } from "./liquid-button";

// Re-export types từ shadcn button
export type { ButtonProps } from "../shadcn/ui/button";
export { buttonVariants } from "../shadcn/ui/button";
