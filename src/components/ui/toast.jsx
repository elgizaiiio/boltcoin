import { cn } from '@/lib/utils';
    import * as ToastPrimitives from '@radix-ui/react-toast';
    import { cva } from 'class-variance-authority';
    import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';
    import React from 'react';

    const ToastProvider = ToastPrimitives.Provider;

    const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
      <ToastPrimitives.Viewport
        ref={ref}
        className={cn(
          'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-auto sm:right-0 sm:top-4 sm:flex-col md:max-w-md',
          className,
        )}
        {...props}
      />
    ));
    ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

    const toastVariants = cva(
      'data-[swipe=move]:transition-none group relative pointer-events-auto flex w-full items-start space-x-3 overflow-hidden rounded-lg border p-4 pr-8 shadow-lg transition-all data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full data-[state=closed]:slide-out-to-right-full',
      {
        variants: {
          variant: {
            default: 'bg-gray-800 border-purple-600 text-white',
            destructive: 'group destructive border-red-600 bg-red-700/80 text-white',
            success: 'group success border-green-600 bg-green-700/80 text-white',
            warning: 'group warning border-yellow-600 bg-yellow-700/80 text-black',
          },
        },
        defaultVariants: {
          variant: 'default',
        },
      },
    );
    
    const ToastIcon = ({ variant }) => {
      switch (variant) {
        case 'destructive':
          return <AlertTriangle className="h-5 w-5 text-red-300" />;
        case 'success':
          return <CheckCircle className="h-5 w-5 text-green-300" />;
        case 'warning':
            return <AlertTriangle className="h-5 w-5 text-yellow-300" />;
        default:
          return <Info className="h-5 w-5 text-purple-300" />;
      }
    };

    const Toast = React.forwardRef(({ className, variant, children, ...props }, ref) => {
      return (
        <ToastPrimitives.Root
          ref={ref}
          className={cn(toastVariants({ variant }), className)}
          {...props}
        >
          <div className="shrink-0">
            <ToastIcon variant={variant} />
          </div>
          <div className="flex-1">{children}</div>
        </ToastPrimitives.Root>
      );
    });
    Toast.displayName = ToastPrimitives.Root.displayName;

    const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
      <ToastPrimitives.Action
        ref={ref}
        className={cn(
          'inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-transparent bg-purple-600 px-3 text-sm font-medium text-white transition-colors hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          'group-[.destructive]:border-red-100/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-red-600 group-[.destructive]:hover:text-white group-[.destructive]:focus:ring-red-500',
          'group-[.success]:border-green-100/40 group-[.success]:hover:border-green-500/30 group-[.success]:hover:bg-green-600 group-[.success]:hover:text-white group-[.success]:focus:ring-green-500',
          'group-[.warning]:border-yellow-100/40 group-[.warning]:hover:border-yellow-500/30 group-[.warning]:hover:bg-yellow-600 group-[.warning]:hover:text-white group-[.warning]:focus:ring-yellow-500',
          className,
        )}
        {...props}
      />
    ));
    ToastAction.displayName = ToastPrimitives.Action.displayName;

    const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
      <ToastPrimitives.Close
        ref={ref}
        className={cn(
          'absolute right-2 top-2 rounded-md p-1 text-white/50 opacity-100 transition-opacity hover:text-white focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-purple-600',
          'group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600',
          'group-[.success]:text-green-300 group-[.success]:hover:text-green-50 group-[.success]:focus:ring-green-400 group-[.success]:focus:ring-offset-green-600',
          'group-[.warning]:text-yellow-800 group-[.warning]:hover:text-yellow-900 group-[.warning]:focus:ring-yellow-400 group-[.warning]:focus:ring-offset-yellow-600',
          className,
        )}
        toast-close=""
        {...props}
      >
        <X className="h-4 w-4" />
      </ToastPrimitives.Close>
    ));
    ToastClose.displayName = ToastPrimitives.Close.displayName;

    const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
      <ToastPrimitives.Title
        ref={ref}
        className={cn('text-sm font-semibold', className)}
        {...props}
      />
    ));
    ToastTitle.displayName = ToastPrimitives.Title.displayName;

    const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
      <ToastPrimitives.Description
        ref={ref}
        className={cn('text-sm opacity-90', className)}
        {...props}
      />
    ));
    ToastDescription.displayName = ToastPrimitives.Description.displayName;

    export {
      Toast,
      ToastAction,
      ToastClose,
      ToastDescription,
      ToastProvider,
      ToastTitle,
      ToastViewport,
    };