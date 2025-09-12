import AppError from "../../errorHelpers/AppError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { UserSearchableFields } from "../user/user.constant";
import { Role } from "../user/user.interface";
import { User } from "../user/user.model";
import httpStatus from "http-status-codes";

const getAllAgent = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(User.find({role: Role.agent}).populate("walletId", "balance status"), query);
  
    const agents = queryBuilder
      .filter()
      .sort()
      .search(UserSearchableFields)
      .fields()
      .paginate();
  
    const [data, meta] = await Promise.all([
      agents.build(),
      queryBuilder.getMeta(),
    ]);
  
    return {
      data,
      meta,
    };
};

const approve = async (agentId: string) => {
  const agent = await User.findById(agentId);

  if (!agent) throw new AppError(httpStatus.NOT_FOUND, "Agent not found");

  if (agent.role !== Role.agent) {
    throw new AppError(httpStatus.BAD_REQUEST, "This user not agent!");
  }

  if (agent.isApproved === true)
    throw new AppError(httpStatus.BAD_REQUEST, "Agent already Approved");

  const updateAgent = await User.findByIdAndUpdate(
    agent._id,
    {
      isApproved: true,
    },
    { new: true, runValidators: true }
  ).select("-password");

  return updateAgent;
};

const suspend = async (agentId: string) => {
  const agent = await User.findById(agentId);

  if (!agent) throw new AppError(httpStatus.NOT_FOUND, "Agent not found");

  if (agent.role !== Role.agent) {
    throw new AppError(httpStatus.BAD_REQUEST, "This user not agent!");
  }

  if (agent.isApproved === false)
    throw new AppError(httpStatus.BAD_REQUEST, "Agent already Suspended");

  const updateAgent = await User.findByIdAndUpdate(
    agent._id,
    {
      isApproved: false,
    },
    { new: true, runValidators: true }
  ).select("-password");

  return updateAgent;
};

export const AgentService = {
  getAllAgent,
  approve,
  suspend,
};
