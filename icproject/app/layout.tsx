import './globals.css'
import Navigation from './components/navigation'

export const metadata = {
  title: 'AI Art Generator',
  description: 'AI Art Generator',
}

const RootLayout = ({children} : {children: React.ReactNode}) => {
  return (
    <html>
      <body>
        <div className='flex flex-col min-h-screen'>
          <Navigation/>

          <main className='flex-1 container max-w-screen-x1 mx-auto px-5 py-5'>{children}</main>

          <footer className='border-t py-5'>
            <div className='text-center text-sm'>
              Coyright @ All rights reserved | ChuongMinhHao
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}

export default RootLayout;