export function error(message: string, error: any) {
  console.error(`[${new Date().toISOString()}] ${message}`, error);
}

export function warn(message: string) {
  console.warn(`[${new Date().toISOString()}] ${message}`);
}

export function info(message: string) {
  console.info(`[${new Date().toISOString()}] ${message}`);
}

export function debug(message: string) {
  console.debug(`[${new Date().toISOString()}] ${message}`);
}
