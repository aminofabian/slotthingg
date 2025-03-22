import { HTMLMotionProps, motion } from 'framer-motion';
import React from 'react';

// Base motion component props that include children and className
export interface BaseMotionProps {
  children?: React.ReactNode;
  className?: string;
}

// Motion div props
export type MotionDivProps = HTMLMotionProps<"div"> & BaseMotionProps;

// Pre-typed motion components
export const MotionDiv = MotionDiv as React.FC<MotionDivProps>;

// Add more motion components as needed
export type MotionHeaderProps = HTMLMotionProps<"header"> & BaseMotionProps;
export const MotionHeader = motion.header as React.FC<MotionHeaderProps>;

export type MotionSectionProps = HTMLMotionProps<"section"> & BaseMotionProps;
export const MotionSection = motion.section as React.FC<MotionSectionProps>;

export type MotionArticleProps = HTMLMotionProps<"article"> & BaseMotionProps;
export const MotionArticle = motion.article as React.FC<MotionArticleProps>;

export type MotionAsideProps = HTMLMotionProps<"aside"> & BaseMotionProps;
export const MotionAside = motion.aside as React.FC<MotionAsideProps>;

export type MotionSpanProps = HTMLMotionProps<"span"> & BaseMotionProps;
export const MotionSpan = motion.span as React.FC<MotionSpanProps>;

// Helper type for creating motion components with specific HTML element types
export type CreateMotionComponent<T extends keyof HTMLElementTagNameMap> = 
  HTMLMotionProps<T> & BaseMotionProps; 