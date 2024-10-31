/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { RATING } from "../../../components/modal/rating";
import api from "../../../components/config/api";
import { Table } from "antd";

function ManageRating() {
  const [rating, setRating] = useState<RATING[]>();

  const columns = [
    {
      title: "No",
      key: "index",
      render: (_text: any, _record: any, index: number) => index + 1,
    },
    {
      title: "POD ID",
      dataIndex: "podId",
      key: "podId",
    },
    {
      title: "Rating Value",
      dataIndex: "ratingValue",
      key: "ratingValue",
      render: (value: any) => value || "N/A",
    },
    {
      title: "Comments",
      dataIndex: "comments",
      key: "comments",
    },
    {
      title: "Customer ID",
      dataIndex: "customerId",
      key: "customerId",
    },
  ];

  const fetchRating = async () => {
    try {
      const response = await api.get("ratings");
      console.log(response.data);
      setRating(response.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchRating();
  }, []);
  return (
    <div>
      <Table dataSource={rating} columns={columns} />
    </div>
  );
}

export default ManageRating;
