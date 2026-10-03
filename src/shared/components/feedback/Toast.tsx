import { toast as baseToast, message, ToastContainer as BaseToastContainer } from '@free-gst/ui';

export const toast = (msg: string, typeOrOptions?: any, duration?: number) => {
  if (typeof baseToast === 'function') {
    return baseToast(msg, typeOrOptions, duration);
  }
  return message?.info ? message.info(msg) : console.log(msg);
};

toast.success = (msg: string, options?: any) => {
  if (message && typeof message.success === 'function') {
    return message.success(msg);
  }
  return toast(msg, options);
};

toast.error = (msg: string, options?: any) => {
  if (message && typeof message.error === 'function') {
    return message.error(msg);
  }
  return toast(msg, options);
};

toast.info = (msg: string, options?: any) => {
  if (message && typeof message.info === 'function') {
    return message.info(msg);
  }
  return toast(msg, options);
};

toast.warning = (msg: string, options?: any) => {
  if (message && typeof message.warning === 'function') {
    return message.warning(msg);
  }
  return toast(msg, options);
};

export { message };
export const ToastContainer = BaseToastContainer;
export default ToastContainer;

export type {
  ToastType,
  ToastItem,
} from '@free-gst/ui';
