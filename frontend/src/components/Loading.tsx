import { Commet } from "react-loading-indicators"

interface LoadingProps {
    size?: "small" | "medium" | "large",
    text ?: string
    textColor ?: string
    color ?: string
}
const Loading = ({ size, text, textColor, color }: LoadingProps) => {
    return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Commet color={[color || "#6366f1", "#c7d2fe"]} size={size} text={text} textColor={textColor}/>
        </div>
    )
}

export default Loading
        