import { useSocket as useSocketContext } from '../context/SocketContext';

/**
 * @deprecated Use `useSocket` from `../context/SocketContext` instead.
 * This hook is kept for backward compatibility and redirects to the context.
 */
export const useSocket = () => {
    return useSocketContext();
};
