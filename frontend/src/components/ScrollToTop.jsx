import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToTop = () => {
    const { pathname, hash } = useLocation()

    useEffect(() => {
        if (hash) {
            const element = document.getElementById(hash.slice(1))

            if (element) {
                element.scrollIntoView({ behavior: 'auto', block: 'start' })
                return
            }
        }

        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }, [pathname, hash])

    return null
}

export default ScrollToTop
