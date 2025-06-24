import Image from 'next/image'
import React from 'react'

function NotFound() {
  return (
    <div>
      <h1>404 - Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <Image
        src="/icon/no-data.gif"
        alt="404 Not Found"
        width={500}
        height={300}
      />
    </div>
  )
}

export default NotFound
