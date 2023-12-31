import { useQuery } from "react-query";
import { TbTrashXFilled, TbEditCircle } from "react-icons/tb";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useTitle from "../../hooks/useTitle";
import CreateTask from "./CreateTask";
import { useContext } from "react";
import { AuthContext } from "../../provider/AuthProvider";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

const Task = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useContext(AuthContext);
  useTitle("Task");
  const {
    data: tasks = [],
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["task"],
    queryFn: async () => {
      const res = await axiosSecure.get(`/task?email=${user.email}`);
      refetch();
      return res.data;
    },
  });

  const handleUpdate = async (data, id) => {
    const updatedData = { ...data, status: true };
    const { data: dbData } = await axiosSecure.patch(
      `/task/${id}`,
      updatedData
    );
    if (dbData.success) {
      refetch();
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: dbData.message,
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosSecure.delete(`/task/${id}`).then((res) => {
          if (res.data.success) {
            refetch();
            Swal.fire({
              title: res.data.message,
              text: "Your file has been deleted.",
              icon: "success",
            });
          }
        });
      }
    });
  };

  if (isLoading) {
    return <div>Loading.....</div>;
  }

  if (!tasks.data.length > 0) {
    return <CreateTask refetch={refetch} />;
  }

  if (tasks.data.length > 0) {
    return (
      <div className="grid gap-2 lg:grid-cols-4">
        {tasks.data.map((task, key) => (
          <div
            className="w-full rounded-lg shadow-md bg-gray-100 lg:max-w-sm"
            key={key}
          >
            <div className="p-4">
              <div className="flex justify-around items-center">
                <div>
                  <button onClick={() => handleUpdate(task, task.id)}>
                    <TbEditCircle size="2em" />
                  </button>
                </div>
                <div>
                  <h4 className="text-xl text-center font-semibold text-blue-600">
                    {task.title}
                  </h4>
                </div>
                <div>
                  <button onClick={() => handleDelete(task?.id)}>
                    <TbTrashXFilled size="2em" />
                  </button>
                </div>
              </div>
              <p className="mb-2 leading-normal text-center">
                {task.description}
              </p>
              <div className="flex justify-center items-center">
                <Link
                  to={`/task/update/${task.id}`}
                  className="px-4 py-2 text-sm text-blue-100 bg-blue-500 rounded shadow"
                >
                  Edit
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
};

export default Task;
