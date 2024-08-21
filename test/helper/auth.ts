export const authHeader = {
  Authorization: `Basic ${Buffer.from('example_user:app_password').toString('base64')}`,
}
