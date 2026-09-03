import axios from 'axios';

// 保存各接口的AbortController，以接口名为键
const abortControllerMap = new Map<string, AbortController>();

// 定义请求函数类型
type RequestFunction = (config: any) => Promise<any>;

/**
 * 可取消的请求辅助函数（自动使用函数名作为请求ID）
 * @param {RequestFunction} requestFn 请求函数（axios实例）
 * @param {Object} params 请求参数
 * @returns {Promise} 返回请求的Promise
 */
export const cancelableRequest = (requestFn: RequestFunction, params: any): Promise<any> => {
  // 使用函数名作为请求ID
  const requestId = requestFn.name;

  // 如果没有函数名，则抛出错误
  if (!requestId) {
    throw new Error('The request function must have a name property');
  }

  // 取消同一接口之前的未完成请求
  if (abortControllerMap.has(requestId)) {
    const previousController = abortControllerMap.get(requestId);
    if (previousController) {
      previousController.abort();
    }
    abortControllerMap.delete(requestId);
  }

  // 创建新的AbortController用于当前请求
  const controller = new AbortController();
  abortControllerMap.set(requestId, controller);

  // 将signal添加到请求配置中
  const config = {
    ...params,
    signal: controller.signal
  };

  // 执行请求
  return requestFn(config)
    .then((response: any) => {
      // 请求成功后清理控制器
      if (abortControllerMap.get(requestId) === controller) {
        abortControllerMap.delete(requestId);
      }
      return response;
    })
    .catch((error: any) => {
      console.log(error, requestId)
      // 如果是取消请求的错误，忽略它
      if (axios.isCancel(error)) {
        return new Promise(() => { }); // 返回一个pending的Promise，避免触发catch
      }

      // 其他错误正常抛出
      if (abortControllerMap.get(requestId) === controller) {
        abortControllerMap.delete(requestId);
      }
      throw error;
    });
};
