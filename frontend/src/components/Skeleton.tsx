import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * A reusable Skeleton component for loading states
 * 
 * @param props - The component props
 * @param props.className - Additional CSS classes to apply
 * @param props.variant - The shape of the skeleton ('text', 'circular', or 'rectangular')
 * @param props.width - The width of the skeleton
 * @param props.height - The height of the skeleton
 * @param props.animation - The animation type ('pulse', 'wave', or 'none')
 * 
 * @returns A skeleton loading component
 */
const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse'
}) => {
  const baseClasses = 'bg-Primary/10';
  const variantClasses = {
    text: 'rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-none'
  };
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-[wave_2s_ease-in-out_infinite]',
    none: ''
  };

  const style = {
    width: width,
    height: height
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
};

interface CardSkeletonProps {
  className?: string;
  variant?: 'donation' | 'event' | 'job' | 'article' | 'profile' | 'generic' | 'eventCard';
}

/**
 * A reusable Card Skeleton component for loading states
 * 
 * @param props - The component props
 * @param props.className - Additional CSS classes to apply
 * @param props.variant - The type of card skeleton ('donation', 'event', 'job', 'article', 'profile', or 'generic')
 * 
 * @returns A card skeleton loading component
 */
export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  className = '',
  variant = 'donation'
}) => {
  const baseClasses = "card bg-gradient-to-b from-[#FAFAFA] to-[#E7EFF6] border-[#C6D8EB] rounded-3xl transition duration-200 border-1";

  const renderContent = () => {
    switch (variant) {
      case 'donation':
        return (
          <>
            <figure className="p-4">
              <div className="w-full h-48 rounded-xl skeleton bg-primary/10" />
            </figure>
            <div className="gap-0 pt-0 card-body text-DarkerPrimary w-full">
              <div className="h-6 w-3/4 rounded-md skeleton bg-primary/10 mb-2" />
              <div className="h-4 w-1/2 rounded-md skeleton bg-primary/10 mb-4" />
              <div className="h-4 w-full rounded-full skeleton bg-primary/10" />
            </div>
          </>
        );

      case 'eventCard':
        return (
            <div className="card max-w-3xl 3xl-auto p-2 rounded-xl w-full bg-white shadow">
              {/* Image skeleton*/}
              <div className="w-full h-70 rounded-xl mb-2 skeleton bg-primary/10" />
              {/* Card body*/}
              <div className="pt-4">
                <div className="flex items-center justify-between">
                  {/* Date Box skeleton */}
                  <div className="flex flex-col items-center justify-center w-20 h-20 p-2 rounded-xl skeleton bg-primary/10">
                    <div className="w-12 h-3 rounded-md skeleton bg-primary/10 mb-1"></div>
                    <div className="w-8 h-6 rounded-md skeleton bg-primary/10"></div>
                  </div>
                  {/* Event Details skeleton */}
                  <div className="flex-1 ml-3">
                    <div className="w-52 sm:w-64 h-6 rounded-md skeleton bg-primary/10 mb-1"></div>
                    <div className="w-40 h-3 rounded-md skeleton bg-primary/10"></div>
                  </div>
                  {/* Join Button skeleton */}
                  <div className="h-8 w-16 rounded-lg skeleton bg-primary/10"></div>
                </div>
              </div>
            </div>
          );
      case 'event':
        return (
          <div className="flex flex-col gap-4 p-4">
            <div className="h-6 w-3/4 rounded-md skeleton bg-primary/10" />
            <div className="h-4 w-1/2 rounded-md skeleton bg-primary/10" />
            <div className="h-4 w-full rounded-md skeleton bg-primary/10" />
          </div>
        );
      case 'job':
        return (
          <div className="flex flex-col gap-4 p-4">
            <div className="flex justify-between">
              <div className="h-6 w-6 rounded-md skeleton bg-primary/10" />
              <div className="h-6 w-6 rounded-md skeleton bg-primary/10" />
            </div>
            <div className="h-5 w-3/4 rounded-md skeleton bg-primary/10" />
            <div className="h-5 w-2/4 rounded-md skeleton bg-primary/10" />
            <div className="h-4 w-2/3 rounded-md skeleton bg-primary/10" />
            <div className="h-4 w-1/3 rounded-md skeleton bg-primary/10" />
          </div>
        );
      case 'article':
        return (
            <div className="flex flex-col gap-4 p-4">
              <div className="flex justify-between">
                <div className="h-54 w-100 rounded-md skeleton bg-primary/10" />
              </div>
            </div>
        );
      case 'profile':
        return (
          <div className="flex flex-col items-center gap-4 p-6">
            <div className="w-20 h-20 rounded-full skeleton bg-primary/10 mb-2" />
            <div className="h-6 w-2/3 rounded-md skeleton bg-primary/10 mb-1" />
            <div className="h-4 w-1/2 rounded-md skeleton bg-primary/10 mb-1" />
            <div className="h-4 w-1/3 rounded-md skeleton bg-primary/10" />
          </div>
        );
      case 'generic':
        return (
          <div className={`bg-white rounded-xl p-4 flex flex-col gap-2 ${className}`}>
            <div className="h-5 w-1/2 rounded-md skeleton bg-primary/10 mb-2" />
            <div className="h-4 w-3/4 rounded-md skeleton bg-primary/10" />
            <div className="h-4 w-2/3 rounded-md skeleton bg-primary/10" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`${baseClasses} ${className}`}>
      {renderContent()}
    </div>
  );
};

export default Skeleton; 