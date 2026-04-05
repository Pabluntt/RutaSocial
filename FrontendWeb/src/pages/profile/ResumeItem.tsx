

type ResumeItemProps = {
    icon : React.ReactNode
    activityDescription : React.ReactNode
    activityValue : React.ReactNode
}

export default function ResumeItem({icon, activityDescription, activityValue} : ResumeItemProps) {
    return (
        <div className="flex grow w-full flex-row gap-1 px-5 justify-between items-center">
            <div className="flex gap-2">
                {icon}
                {activityDescription}
            </div>
            {activityValue}
        </div>
    )
};
