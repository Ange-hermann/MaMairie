declare module 'react-qr-scanner' {
  import { CSSProperties } from 'react'

  interface QrScannerProps {
    delay?: number
    onError?: (error: any) => void
    onScan?: (data: any) => void
    onLoad?: () => void
    style?: CSSProperties
    constraints?: MediaStreamConstraints
    className?: string
  }

  const QrScanner: React.FC<QrScannerProps>
  export default QrScanner
}
