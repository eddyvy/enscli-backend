export type LlamaCloudParserResponse = {
  id: string
  status: 'PENDING' | 'SUCCESS' | 'ERROR' | 'PARTIAL_SUCCESS'
}
