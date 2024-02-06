import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addPost, fetchPosts, fetchTags } from "../api/api";
import { useState } from "react";

const PostsList = () => {
  const [page, setPage] = useState(1);

  const {
    data: postsData,
    isLoading,
    isError,
    status,
    error,
  } = useQuery({
    queryKey: ["posts", { page }],
    queryFn: () => fetchPosts(page),
    staleTime: 1000 * 60 * 5, // given to cache the prev page results for 5 mins
    // gcTime: 0, // data will never be cached and will always remain stale
    // refetchInterval:1000*5, // call api after every 5 secs
  });

  const { data: tagsData } = useQuery({
    queryKey: ["tags"],
    queryFn: fetchTags,
    staleTime: Infinity,
  });

  const queryClient = useQueryClient();

  const {
    mutate,
    isError: isPostError,
    isPending,
    error: postError,
    reset,
  } = useMutation({
    mutationFn: addPost,
    onMutate: () => {
      return { id: 1 };
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ["posts"],
        exact: true,
        // predicate: (query) =>
        //   query.queryKey[0] === "posts" && query.queryKey[1].page >= 2,
      });
    },
    // onError: (error, variables, context) => {},
    // onSettled: (data, error, variables, context) => {},
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get("title");
    const tags = Array.from(formData.keys()).filter(
      (key) => formData.get(key) === "on"
    );

    if (!title || !tags) {
      return;
    }

    console.log({ title, tags });

    mutate({ id: postsData?.data?.length + 1, title, tags });

    e.target.reset();
    // refetch()
  };

  console.log({ postsData, isLoading, isError, status });
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="text" name="title" placeholder="enter your post" />
        <div>
          {tagsData?.map((tag) => {
            return (
              <div key={tag}>
                <input name={tag} id={tag} type="checkbox" />
                {/* <span>{tag}</span> */}
                <label htmlFor={tag}>{tag}</label>
              </div>
            );
          })}
        </div>
        <button>Post</button>
      </form>

      {(isLoading || isPending) && <h1>Loading....</h1>}
      {isError && <p>{error?.message}</p>}
      {isPostError && <p onClick={() => reset()}>{postError?.message}</p>}

      <div>
        <button
          onClick={() => setPage((oldPage) => Math.max(oldPage - 1, 0))}
          disabled={!postsData?.prev}
        >
          Previous Page
        </button>
        <span>{page}</span>
        <button
          onClick={() => setPage((oldPage) => oldPage + 1)}
          disabled={!postsData?.next}
        >
          Next Page
        </button>
      </div>
      {postsData?.data?.map((post) => (
        <div key={post?.id}>
          <h2>{post?.title}</h2>
          {post?.tags?.map((tag) => (
            <h5 key={tag}>{tag}</h5>
          ))}
        </div>
      ))}
    </div>
  );
};

export default PostsList;
