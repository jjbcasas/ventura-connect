import { useCallback } from "react"

// Audio setup
const keyStrokeSounds = [
    new Audio("/sounds/keystroke1.mp3"),
    new Audio("/sounds/keystroke2.mp3"),
    new Audio("/sounds/keystroke3.mp3"),
    new Audio("/sounds/keystroke4.mp3")
]

function useKeyboardSound(){
    const playRandomKeyStrokeSound = useCallback(() => {
        const  randomSound = keyStrokeSounds[Math.floor(Math.random() * keyStrokeSounds.length)]

        randomSound.currentTime = 0 //reset to start
        randomSound.play().catch(err => console.error("Audio play failed:", err))
    }, [])

    return { playRandomKeyStrokeSound }
}

export default useKeyboardSound