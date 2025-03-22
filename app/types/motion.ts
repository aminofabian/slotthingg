import { HTMLMotionProps, motion } from 'framer-motion';
import React from 'react';

// Base motion component props that include children and className
export interface BaseMotionProps {
  children?: React.ReactNode;
  className?: string;
}

// Motion div props
export type MotionDivProps = HTMLMotionProps<"div"> & {
  className?: string;
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
};

// Pre-typed motion components
export const MotionDiv = motion.div as React.FC<MotionDivProps>;

// Add more motion components as needed
export type MotionHeaderProps = HTMLMotionProps<"header"> & BaseMotionProps;
export const MotionHeader = motion.header as React.FC<MotionHeaderProps>;

export type MotionSectionProps = HTMLMotionProps<"section"> & BaseMotionProps;
export const MotionSection = motion.section as React.FC<MotionSectionProps>;

export type MotionArticleProps = HTMLMotionProps<"article"> & BaseMotionProps;
export const MotionArticle = motion.article as React.FC<MotionArticleProps>;

export type MotionAsideProps = HTMLMotionProps<"aside"> & BaseMotionProps;
export const MotionAside = motion.aside as React.FC<MotionAsideProps>;

export type MotionSpanProps = HTMLMotionProps<"span"> & {
  className?: string;
  children?: React.ReactNode;
};

export const MotionSpan = motion.span as React.FC<MotionSpanProps>;

export type MotionButtonProps = HTMLMotionProps<"button"> & React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
  children?: React.ReactNode;
};

export const MotionButton = motion.button as React.FC<MotionButtonProps>;

export type MotionAnchorProps = HTMLMotionProps<"a"> & React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  className?: string;
  children?: React.ReactNode;
};

export const MotionAnchor = motion.a as React.FC<MotionAnchorProps>;

// Helper type for creating motion components with specific HTML element types
export type CreateMotionComponent<T extends keyof HTMLElementTagNameMap> = 
  HTMLMotionProps<T> & BaseMotionProps; 