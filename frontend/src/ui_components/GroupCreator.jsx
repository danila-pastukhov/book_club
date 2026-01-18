



import { BASE_URL } from "@/api"
import pic from "../images/pic.jpg"
import { FormatDate } from "@/services/formatDate"
import { Link } from "react-router-dom"

const GroupCreator = ({reading_group}) => {
  return (
    <Link to={`/profile/${reading_group.creator.username}`}>
    <div className="flex items-center gap=4 ">

      
      <span className="flex items-center gap-2">
        <div className="w-[40px] h-[40px] rounded-full overflow-hidden">
          <img
            src={`${BASE_URL}${reading_group.creator.profile_picture}`}
            className="c rounded-full w-full h-full object-cover"
          />
        </div>

        <small className="text-[#696A75] text-[14px]">
          {reading_group.creator.first_name} {reading_group.creator.last_name}
        </small>
      </span>

      <small className="text-[#696A75] text-[14px] ml-3">
        {FormatDate(reading_group.created_at)}
      </small>


    </div>
    </Link>
  )
}

export default GroupCreator
