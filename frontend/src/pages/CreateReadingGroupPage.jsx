import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
//   SelectGroup,
//   SelectLabel,
// } from "@/components/ui/select";
import InputError from "@/ui_components/InputError";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createReadingGroup, updateReadingGroup } from "@/services/apiBook";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import SmallSpinner from "@/ui_components/SmallSpinner";
import SmallSpinnerText from "@/ui_components/SmallSpinnerText";
import LoginPage from "./LoginPage";

const CreateReadingGroupPage = ({ reading_group, isAuthenticated }) => {
  const { register, handleSubmit, formState, setValue } = useForm({
    defaultValues: reading_group ? reading_group : {},
  });
  const { errors } = formState;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const readingGroupID = reading_group?.id;

  const updateMutation = useMutation({
    mutationFn: ({ data, id }) => updateReadingGroup(data, id),
    onSuccess: () => {
      navigate("/");
      toast.success("Your group has been updated successfully!");
      console.log("Your group has been updated successfully!");
    },

    onError: (err) => {
      toast.error(err.message);
      console.log("Error updating group", err);
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => createReadingGroup(data),
    onSuccess: () => {
      toast.success("New group added successfully");
      queryClient.invalidateQueries({ queryKey: ["reading_groups"] });
      navigate("/");
    },
  });

  function onSubmit(data) {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);

    if (data.featured_image && data.featured_image[0]) {
      if (data.featured_image[0] != "/") {
        formData.append("featured_image", data.featured_image[0]);
      }
    }
    if (reading_group && readingGroupID) {
      updateMutation.mutate({ data: formData, id: readingGroupID });
    } else {
      mutation.mutate(formData);
    }
  }

  if (isAuthenticated === false) {
    return <LoginPage />;
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`${
        reading_group && "h-[90%] overflow-auto"
      }  md:px-16 px-8 py-6 flex flex-col mx-auto my-9 items-center gap-6 w-fit rounded-lg bg-[#FFFFFF] shadow-xl dark:text-white dark:bg-[#141624]`}
    >
      <div className="flex flex-col gap-2 justify-center items-center mb-2">
        <h3 className="font-semibold text-2xl max-sm:text-xl">
          {reading_group ? "Update Group" : "Create Group"}
        </h3>

        <p className="max-sm:text-[14px]">
          {reading_group
            ? "Do you want to update your group?"
            : "Create a group to start reading with others."}
        </p>
      </div>

      <div>
        <Label htmlFor="name" className="dark:text-[97989F]">
          Title *
        </Label>
        <Input
          type="text"
          id="name"
          {...register("name", {
            required: "Group's name is required",
            minLength: {
              value: 3,
              message: "The name must be at least 3 characters",
            },
          })}
          placeholder="Give your group a name"
          className="border-2 border-[#141624] dark:border-[#3B3C4A] focus:outline-0 h-[40px] w-[400px] max-sm:w-[300px] max-sm:text-[14px]"
        />

        {errors?.title?.message && <InputError error={errors.title.message} />}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Give a brief description of your book"
          {...register("description", {
            required: "Book's content is required"
          })}
          className="border-2 border-[#141624] dark:border-[#3B3C4A] focus:outline-0 h-[180px]  w-[400px] text-justify max-sm:w-[300px] max-sm:text-[14px]"
        />
        {errors?.description?.message && (
          <InputError error={errors.description.message} />
        )}
      </div>

      {/* <div className="w-full">
        <Label htmlFor="category">Category *</Label>

        <Select
          {...register("category", { required: "Book's category is required" })}
          onValueChange={(value) => setValue("category", value)}
          defaultValue={book ? book.category : ""}
        >
          <SelectTrigger className="border-2 border-[#141624] dark:border-[#3B3C4A] focus:outline-0 h-[40px] w-full max-sm:w-[300px] max-sm:text-[14px]">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Categories</SelectLabel>
              <SelectItem value="Science Fiction">Science Fiction</SelectItem>
              <SelectItem value="Fantasy">Fantasy</SelectItem>
              <SelectItem value="Detective Fiction">Detective Fiction</SelectItem>
              <SelectItem value="Thriller">Thriller</SelectItem>
              <SelectItem value="Romance">Romance</SelectItem>
              <SelectItem value="Horror">Horror</SelectItem>
              <SelectItem value="Historical Fiction">Historical Fiction</SelectItem>
              <SelectItem value="Adventure">Adventure</SelectItem>                            
            </SelectGroup>
          </SelectContent>
        </Select>

        {errors?.category?.message && (
          <InputError error={errors.category.message} />
        )}
      </div> */}
      {/* Could add group categories */}

      <div className="w-full">
        <Label htmlFor="featured_image">Featured Image *</Label>
        <Input
          type="file"
          id="picture"
          {...register("featured_image", {
            required: reading_group ? false : "Group's image is required",
          })}
          className="border-2 border-[#141624] dark:border-[#3B3C4A] focus:outline-0 h-[40px] w-full max-sm:w-[300px] max-sm:text-[14px]"
        />

        {errors?.featured_image?.message && (
          <InputError error={errors.featured_image.message} />
        )}
      </div>

      <div className="w-full flex items-center justify-center flex-col my-4">
        {reading_group ? (
          <button
            disabled={updateMutation.isPending}
            className="bg-[#4B6BFB] text-white w-full py-3 px-2 rounded-md flex items-center justify-center gap-2"
          >
            {updateMutation.isPending ? (
              <>
                {" "}
                <SmallSpinner /> <SmallSpinnerText text="Updating group..." />{" "}
              </>
            ) : (
              <SmallSpinnerText text="Update group" />
            )}
          </button>
        ) : (
          <button
            disabled={mutation.isPending}
            className="bg-[#4B6BFB] text-white w-full py-3 px-2 rounded-md flex items-center justify-center gap-2"
          >
            {mutation.isPending ? (
              <>
                {" "}
                <SmallSpinner /> <SmallSpinnerText text="Creating group..." />{" "}
              </>
            ) : (
              <SmallSpinnerText text="Create group" />
            )}
          </button>
        )}
      </div>
    </form>
  );
};

export default CreateReadingGroupPage;
