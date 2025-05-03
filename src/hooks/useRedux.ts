import { RootState } from "@/stores";
import { useDispatch, useSelector } from "react-redux";

export const useRedux = (reducer: keyof RootState) => {
  const state = useSelector((state: RootState) => state[reducer]);
  const dispatch = useDispatch();

  return {
    state,
    dispatch,
  };
};
