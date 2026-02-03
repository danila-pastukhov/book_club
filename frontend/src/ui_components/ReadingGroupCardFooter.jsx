import { resolveMediaUrl } from "@/api";
import { FormatDate } from "@/services/formatDate";
import { Link } from "react-router-dom";

const ReadingGroupCardFooter = ({ reading_group }) => {
  return (
    <Link to={`/profile/${reading_group.creator.username}`}>
    <div className="flex items-center gap=4 ">
      <span className="flex items-center gap-2">
        <div className="w-[40px] h-[40px] rounded-full overflow-hidden">
          <img
            src={resolveMediaUrl(reading_group.creator.profile_picture)}
            className="c rounded-full w-full h-full object-cover"
          />
        </div>

        <small className="text-[#97989F] text-[12px] font-semibold">
          {reading_group.creator.first_name} {reading_group.creator.last_name}
        </small>
      </span>

      <small className="text-[#97989F] text-[12px] font-semibold ml-3">
        {FormatDate(reading_group.created_at)}
      </small>
    </div>
    </Link>
  );
};

export default ReadingGroupCardFooter;
