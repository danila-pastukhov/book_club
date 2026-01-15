// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { useForm } from "react-hook-form";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
//   SelectGroup,
//   SelectLabel,
// } from "@/components/ui/select";
// import InputError from "@/ui_components/InputError";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { createBook, updateBook } from "@/services/apiBook";
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";
// import SmallSpinner from "@/ui_components/SmallSpinner";
// import SmallSpinnerText from "@/ui_components/SmallSpinnerText";
// import LoginPage from "./LoginPage";

// const CreateReadingGroupPage = ({ book, isAuthenticated }) => { // book is?
//   const { register, handleSubmit, formState, setValue } = useForm({
//     defaultValues: book ? book : {},
//   });
//   const { errors } = formState;
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();

//   const bookID = book?.id;

//   const updateMutation = useMutation({
//     mutationFn: ({ data, id }) => updateBook(data, id),
//     onSuccess: () => {
//       navigate("/");
//       toast.success("Your group has been updated successfully!");
//       console.log("Your group has been updated successfully!");
//     },

//     onError: (err) => {
//       toast.error(err.message);
//       console.log("Error updating group", err);
//     },
//   });

//   const mutation = useMutation({
//     mutationFn: (data) => createBook(data),
//     onSuccess: () => {
//       toast.success("New group created successfully");
//       queryClient.invalidateQueries({ queryKey: ["books"] });
//       navigate("/");
//     },
//   });

//   // function onSubmit(data) {
//   //   const formData = new FormData();
//   //   formData.append("title", data.title);
//   //   formData.append("content", data.content);
//   //   formData.append("category", data.category);

//   //   if (data.featured_image && data.featured_image[0]) {
//   //     if (data.featured_image[0] != "/") {
//   //       formData.append("featured_image", data.featured_image[0]);
//   //     }
//   //   }
//   //   if (book && bookID) {
//   //     updateMutation.mutate({ data: formData, id: bookID });
//   //   } else {
//   //     mutation.mutate(formData);
//   //   }
//   // }

//   // if (isAuthenticated === false) {
//   //   return <LoginPage />;
//   // }

//   return (
//     <button
//             disabled={mutation.isPending}
//             className="bg-[#4B6BFB] text-white w-full py-3 px-2 rounded-md flex items-center justify-center gap-2"
//           >
//             {mutation.isPending ? (
//               <>
//                 {" "}
//                 <SmallSpinner /> <SmallSpinnerText text="Creating post..." />{" "}
//               </>
//             ) : (
//               <SmallSpinnerText text="Hello i am group button" />
//             )}
//           </button>
//   );
// };

// export default CreateReadingGroupPage;
