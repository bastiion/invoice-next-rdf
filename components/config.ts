const config =  {
  apiURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/graphql',
  staticContentURL: process.env.NEXT_PUBLIC_STATIC_URL || 'http://localhost:3001/static'
}

export default config
