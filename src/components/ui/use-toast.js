import { useState, useEffect, useCallback } from "react"

    const TOAST_LIMIT = 5; 
    const TOAST_REMOVE_DELAY = 500; 

    let count = 0;
    function generateId() {
      count = (count + 1) % Number.MAX_SAFE_INTEGER;
      return count.toString();
    }

    const actionTypes = {
      ADD_TOAST: 'ADD_TOAST',
      UPDATE_TOAST: 'UPDATE_TOAST',
      DISMISS_TOAST: 'DISMISS_TOAST',
      REMOVE_TOAST: 'REMOVE_TOAST',
    };

    let memoryState = { toasts: [] };

    const listeners = [];

    const toast = (props) => {
      const id = generateId();

      const update = (updateProps) => dispatch({
        type: actionTypes.UPDATE_TOAST,
        toast: { ...updateProps, id },
      });
      const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id });

      dispatch({
        type: actionTypes.ADD_TOAST,
        toast: {
          ...props,
          id,
          open: true,
          onOpenChange: (open) => {
            if (!open) dismiss();
          },
        },
      });

      return {
        id: id,
        dismiss,
        update,
      };
    };

    const reducer = (state, action) => {
      switch (action.type) {
        case actionTypes.ADD_TOAST:
          return {
            ...state,
            toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
          };

        case actionTypes.UPDATE_TOAST:
          return {
            ...state,
            toasts: state.toasts.map((t) =>
              t.id === action.toast.id ? { ...t, ...action.toast } : t
            ),
          };

        case actionTypes.DISMISS_TOAST: {
          const { toastId } = action;
          
          if (toastId === undefined) {
            return {
              ...state,
              toasts: state.toasts.map(t => ({ ...t, open: false })),
            };
          }
          
          return {
            ...state,
            toasts: state.toasts.map((t) =>
              t.id === toastId ? { ...t, open: false } : t
            ),
          };
        }
        
        case actionTypes.REMOVE_TOAST:
          if (action.toastId === undefined) {
            return {
              ...state,
              toasts: [],
            };
          }
          return {
            ...state,
            toasts: state.toasts.filter((t) => t.id !== action.toastId),
          };
        default:
          return state;
      }
    };

    const dispatch = (action) => {
      memoryState = reducer(memoryState, action);
      listeners.forEach((listener) => {
        listener(memoryState);
      });
    };


    function useToast() {
      const [state, setState] = useState(memoryState);

      useEffect(() => {
        listeners.push(setState);
        return () => {
          const index = listeners.indexOf(setState);
          if (index > -1) {
            listeners.splice(index, 1);
          }
        };
      }, [state]);

      const removeToast = useCallback((toastId) => {
        dispatch({ type: actionTypes.REMOVE_TOAST, toastId: toastId });
      }, []);

      useEffect(() => {
        const timers = new Map();

        state.toasts.forEach((t) => {
          if (!t.open) {
            
            if (!timers.has(t.id + '_remove')) {
              const removeTimer = setTimeout(() => {
                removeToast(t.id);
                timers.delete(t.id + '_remove');
              }, TOAST_REMOVE_DELAY);
              timers.set(t.id + '_remove', removeTimer);
            }
            if (timers.has(t.id)) {
               clearTimeout(timers.get(t.id));
               timers.delete(t.id);
            }
          } else if (t.open && !timers.has(t.id)) {
            const duration = t.duration || 5000;
            if (duration !== Infinity) {
              const timer = setTimeout(() => {
                dispatch({ type: actionTypes.DISMISS_TOAST, toastId: t.id });
              }, duration);
              timers.set(t.id, timer);
            }
          }
        });

        return () => {
          timers.forEach(clearTimeout);
        };
      }, [state.toasts, removeToast]);

      return {
        ...state,
        toast,
        dismiss: (toastId) => dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
      };
    }

    export { useToast, toast };