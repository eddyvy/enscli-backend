export function setEnv() {
  process.env.AZURE_STORAGE_CONNECTION_STRING = 'connection-string'
  process.env.AZURE_STORAGE_CONTAINER_NAME = 'container-name'
  process.env.LLAMA_CLOUD_API_KEY = 'api-key'
  process.env.LLAMA_CLOUD_API_URL = 'api-url'
}

export function clearEnv() {
  delete process.env.AZURE_STORAGE_CONNECTION_STRING
  delete process.env.AZURE_STORAGE_CONTAINER_NAME
  delete process.env.LLAMA_CLOUD_API_KEY
  delete process.env.LLAMA_CLOUD_API_URL
}
