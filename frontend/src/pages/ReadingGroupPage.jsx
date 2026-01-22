// THIS IS TRYING TO DETAIL THE SHOWING OF GROUPS (.../groups/group-name)

import Badge from "@/ui_components/Badge";
import GroupCreator from "@/ui_components/GroupCreator";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { deleteReadingGroup, getReadingGroup, addUserToGroup} from "@/services/apiBook";
import Spinner from "@/ui_components/Spinner";
import { BASE_URL } from "@/api";
import { HiPencilAlt } from "react-icons/hi";
import { MdDelete } from "react-icons/md";
import Modal from "@/ui_components/Modal";
import CreatePostPage from "./CreatePostPage";
import { useState } from "react";
import { toast } from "react-toastify";
import SmallSpinner from "@/ui_components/SmallSpinner";
import SmallSpinnerText from "@/ui_components/SmallSpinnerText";


const ReadingGroupPage = ({ username, isAuthenticated }) => {

  const { slug } = useParams();
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()
  function toggleModal(){
    setShowModal(curr => !curr)
  }

  const {
    isPending,
    isError,
    error,
    data: reading_group,
  } = useQuery({
    queryKey: ["groups", slug],
    queryFn: () => getReadingGroup(slug),
  });

  const reading_groupID = reading_group?.id

  console.log(reading_group);

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteReadingGroup(id),
    onSuccess: () => {
      toast.success("Your group has been deleted successfully! I think?")  // REM
      navigate("/")
    },

    onError: (err) => {
      console.log(err)
      toast.error(err.message)
    }
  })


  const mutation = useMutation({
    mutationFn: (id) => addUserToGroup(id),
    onSuccess: () => {
      toast.success("You have successfully joined the group!");
    },
  });


  function onSubmit() {
    
      mutation.mutate(reading_groupID);
    
  }


  function handleDeleteReadingGroup(){
    const popUp = window.confirm("Are you sure you want to delete this group? Haha group not post")  // REM
    if(!popUp){
      return;
    }

    deleteMutation.mutate(reading_groupID)



  }

  

  if (isPending) {
    return <Spinner />;
  }

  return (
    <>

      <div className="padding-dx max-container py-9 gap-6 flex flex-col">
        <div className="flex justify-between items-center gap-4">
          <span className="flex items-center gap-6">
            <div className="w-[60px] h-[60px] rounded-full overflow-hidden">
              <img
                className="c rounded-full w-full h-full object-cover"
                src={`${BASE_URL}${reading_group.featured_image}`}
              />
            </div>
            <h1 className="py-6 leading-normal text-2xl md:text-3xl text-[#181A2A] tracking-wide font-semibold dark:text-[#FFFFFF]">
              {reading_group.name}
            </h1>
          </span>
          <button onClick={onSubmit}
              disabled={mutation.isPending}
              className="bg-[#4B6BFB] text-white py-3 px-8 rounded-md flex items-right justify-center gap-2"
              >
                {mutation.isPending ? (
                  <>
                    {" "}
                    <SmallSpinner /> <SmallSpinnerText text="Joining group..." />{" "}
                  </>
                  ) : (
                    <SmallSpinnerText text="Join group" />
                )}
              </button>
          {isAuthenticated && username === reading_group.creator.username && (
            <span className="flex justify-between items-center gap-2">
              <HiPencilAlt onClick={toggleModal} className="dark:text-white text-3xl cursor-pointer" />

              <MdDelete onClick={handleDeleteReadingGroup} className="dark:text-white text-3xl cursor-pointer" />
            </span>
          )}
        </div>

        <GroupCreator reading_group={reading_group} />
        
        <p className="text-[18px] leading-[2rem] text-justify text-[#3B3C4A] dark:text-[#BABABF]">
          {reading_group.description || "This group doesn't have a description."}
        </p>
      </div>

     {showModal && <Modal toggleModal={toggleModal}> 
        <CreatePostPage reading_group={reading_group} />
      </Modal>}
    </>
  );
};

export default ReadingGroupPage;
