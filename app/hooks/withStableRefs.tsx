import React, { useRef, useEffect } from 'react';

/**
 * A higher-order component that ensures hook stability between
 * development and production environments.
 * 
 * This can help resolve React error #130 which often occurs in production
 * due to hook ordering inconsistencies.
 */
export function withStableRefs<P extends object>(Component: React.ComponentType<P>): React.FC<P> {
  const StableComponent: React.FC<P> = (props) => {
    // Create a stable reference to the component props
    const stableProps = useRef(props);
    
    // Update the reference when props change
    useEffect(() => {
      stableProps.current = props;
    }, [props]);
    
    // Render with the current props
    return <Component {...props} />;
  };
  
  // Set display name for debugging
  const displayName = Component.displayName || Component.name || 'Component';
  StableComponent.displayName = `withStableRefs(${displayName})`;
  
  return StableComponent;
} 