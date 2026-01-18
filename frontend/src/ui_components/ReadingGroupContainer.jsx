import ReadingGroupCard from "./ReadingGroupCard"
import Spinner from "./Spinner"

const ReadingGroupContainer = ({isPending, reading_groups=[]}) => { // , title="Groups"

  if(isPending){
    return <Spinner />
  }

  return (
    <section className="padding-x py-6  max-container">
    {/* <h2 className="font-semibold text-xl mb-6 dark:text-white text-center">
      {title}
    </h2> */}

    <div className="flex items-center gap-6 justify-center flex-wrap">
      {reading_groups.map((reading_group) => <ReadingGroupCard key={reading_group.id} reading_group={reading_group} />)}
      
        </div>
    </section>
  )
}

export default ReadingGroupContainer