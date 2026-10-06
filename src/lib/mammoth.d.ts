declare module "mammoth/mammoth.browser.js" {
  export function extractRawText(input: { arrayBuffer: ArrayBufferLike }): Promise<{ value: string; messages: Array<unknown> }>;
}