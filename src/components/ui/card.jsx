import React from 'react';
    import { cn } from '@/lib/utils';

    const Card = React.forwardRef(({ className, ...props }, ref) => (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border bg-card text-card-foreground shadow-md hover:shadow-purple-500/40 transition-shadow duration-300',
          'bg-black/40 backdrop-blur-sm border-purple-500/40', 
          className
        )}
        {...props} />
    ));
    Card.displayName = 'Card';

    const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
      <div
        ref={ref}
        className={cn('flex flex-col space-y-1 p-3 sm:p-4', className)} 
        {...props} />
    ));
    CardHeader.displayName = 'CardHeader';

    const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
      <h3
        ref={ref}
        className={cn('text-md sm:text-xl font-semibold leading-none tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500', className)} 
        {...props} />
    ));
    CardTitle.displayName = 'CardTitle';

    const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
      <p
        ref={ref}
        className={cn('text-xs sm:text-sm text-muted-foreground', 'text-purple-300', className)} 
        {...props} />
    ));
    CardDescription.displayName = 'CardDescription';

    const CardContent = React.forwardRef(({ className, ...props }, ref) => (
      <div ref={ref} className={cn('p-3 pt-0 sm:p-4 sm:pt-0', className)} {...props} /> 
    ));
    CardContent.displayName = 'CardContent';

    const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
      <div ref={ref} className={cn('flex items-center p-3 pt-0 sm:p-4 sm:pt-0', className)} {...props} /> 
    ));
    CardFooter.displayName = 'CardFooter';

    export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };