import React from 'react';
    import * as DialogPrimitive from '@radix-ui/react-dialog';
    import { X } from 'lucide-react';
    import { cn } from '@/lib/utils';

    const Dialog = DialogPrimitive.Root;
    const DialogTrigger = DialogPrimitive.Trigger;
    const DialogPortal = DialogPrimitive.Portal;
    const DialogClose = DialogPrimitive.Close;

    const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
      <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
          'fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          className
        )}
        {...props} />
    ));
    DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

    const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            'fixed left-[50%] top-[50%] z-50 grid w-[90vw] max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-4 sm:p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
            'bg-gradient-to-br from-gray-800 via-purple-900 to-gray-800 border-purple-500/50 text-white',
            className
          )}
          {...props}>
          {children}
          <DialogPrimitive.Close
            className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPortal>
    ));
    DialogContent.displayName = DialogPrimitive.Content.displayName;

    const DialogHeader = ({
      className,
      ...props
    }) => (
      <div
        className={cn('flex flex-col space-y-1 text-center sm:text-right', className)}
        {...props} />
    );
    DialogHeader.displayName = 'DialogHeader';

    const DialogFooter = ({
      className,
      ...props
    }) => (
      <div
        className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-start sm:space-x-2 sm:space-x-reverse', className)}
        {...props} />
    );
    DialogFooter.displayName = 'DialogFooter';

    const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
      <DialogPrimitive.Title
        ref={ref}
        className={cn('text-md sm:text-lg font-semibold leading-none tracking-tight', className)}
        {...props} />
    ));
    DialogTitle.displayName = DialogPrimitive.Title.displayName;

    const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
      <DialogPrimitive.Description
        ref={ref}
        className={cn('text-xs sm:text-sm text-muted-foreground', 'text-purple-300', className)}
        {...props} />
    ));
    DialogDescription.displayName = DialogPrimitive.Description.displayName;

    export {
      Dialog,
      DialogPortal,
      DialogOverlay,
      DialogTrigger,
      DialogClose,
      DialogContent,
      DialogHeader,
      DialogFooter,
      DialogTitle,
      DialogDescription,
    };