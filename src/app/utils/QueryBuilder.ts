import { Query } from "mongoose";
import { excludeField } from "../constant";

export class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public readonly query: Record<string, string>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, string>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  filter(): this {
    const filter = { ...this.query };

    const dateRangeFilter: Record<string, unknown> = {};
    if (filter.startDate) {
      if (!dateRangeFilter.createdAt) {
        dateRangeFilter.createdAt = {};
      }
      (dateRangeFilter.createdAt as Record<string, unknown>).$gte = new Date(
        filter.startDate as string
      );
      delete filter.startDate;
    }

    if (filter.endDate) {
      if (!dateRangeFilter.createdAt) {
        dateRangeFilter.createdAt = {};
      }
      const endDate = new Date(filter.endDate as string);
      endDate.setHours(23, 59, 59, 999);
      (dateRangeFilter.createdAt as Record<string, unknown>).$lte = endDate;
      delete filter.endDate;
    }

    for (const field of excludeField) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete filter[field];
    }

    this.modelQuery = this.modelQuery.find({ ...filter, ...dateRangeFilter });

    return this;
  }

  search(searchableField: string[]): this {
    const searchTerm = this.query.searchTerm || "";
    const searchQuery = {
      $or: searchableField.map((field) => ({
        [field]: { $regex: searchTerm, $options: "i" },
      })),
    };
    this.modelQuery = this.modelQuery.find(searchQuery);
    return this;
  }

  sort(): this {
    const sort = this.query.sort || "-createdAt";

    this.modelQuery = this.modelQuery.sort(sort);

    return this;
  }
  fields(): this {
    if (this.query.fields) {
      const fields = this.query.fields.split(",").join(" ");
      this.modelQuery = this.modelQuery.select(fields);
    } else {
      this.modelQuery = this.modelQuery.select("-password");
    }

    return this;
  }
  paginate(): this {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);

    return this;
  }

  build() {
    return this.modelQuery;
  }

  async getMeta() {
    const countQuery = this.modelQuery.model.find(this.modelQuery.getFilter());

    const totalDocuments = await countQuery.countDocuments();

    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;

    const totalPage = Math.ceil(totalDocuments / limit);

    return { page, limit, total: totalDocuments, totalPage };
  }
}
