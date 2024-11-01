/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Form, Modal, Popconfirm, Table } from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useForm } from "antd/es/form/Form";
import api from "../config/api";
import moment from "moment";
import uploadFile from "../../utils/upload";

export interface Column {
  title: string;
  dataIndex: string;
  key: string;
  render?: (text: any, record: any, index: number) => any;
}

interface DashboardTemplateProps {
  title: string;
  columns: Column[];
  apiURI: string;
  formItems: React.ReactElement;
  fileList: any;
}

function DashboardTemplate({
  columns,
  formItems,
  apiURI,
  title,
  fileList,
}: DashboardTemplateProps) {
  const [datas, setDatas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form] = useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  //GET
  const fetchData = async () => {
    try {
      const response = await api.get(apiURI);
      setDatas(response.data);
      setFetching(false);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error(`Error fetching ${title}`);
    }
  };

  //CREATE OR UPDATE
  const handleSubmit = async (values: {
    imageUrl: string;
    dateOfBirthday: moment.MomentInput;
    id: any;
  }) => {
    if (fileList && fileList.length > 0) {
      try {
        console.log(fileList[0].originFileObj);
        const img = await uploadFile(fileList[0].originFileObj);
        console.log(img);
        values.imageUrl = img; // Set uploaded image URL
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast.error("Image upload failed!");
        return; // Stop submission if image upload fails
      }
    }

    // Optional: Format date if using DatePicker
    if (values.dateOfBirthday) {
      const dateFormatted = moment(values.dateOfBirthday).format("DD-MM-YYYY");
      values.dateOfBirthday = dateFormatted;
    }

    try {
      console.log("Submitting form...");
      setLoading(true);

      if (values.id) {
        console.log("Updating item with ID:", values.id);
        await api.put(`${apiURI}/${values.id}`, values);
        toast.success("Update successfully");
      } else {
        console.log("Creating new item");
        await api.post(apiURI, values);
        toast.success("Successfully created!");
      }

      fetchData(); // Refresh data after successful operation
      form.resetFields(); // Clear form
      setShowModal(false); // Close modal
    } catch (error) {
      console.error(error);
      toast.error("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  //DELETE
  const handleDelete = async (id: string) => {
    try {
      await api.delete(`${apiURI}/${id}`);
      toast.success("Success deleted!!!");
      fetchData();
    } catch (error) {
      console.log(error);
      toast.error("delete error");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const tableColumn = [
    ...columns,
    {
      title: "Action",
      dataIndex: "id",
      key: "id",
      render: (record: { dateOfBirth: moment.MomentInput; id: string }) => (
        <>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <Button
              type="primary"
              onClick={() => {
                const recordValiDate = {
                  ...record,
                  dateOfBirthday: record.dateOfBirth
                    ? moment(record.dateOfBirth, "DD-MM-YYYY HH:mm")
                    : null,
                };
                form.setFieldsValue(recordValiDate);
                setShowModal(true);
                // form.resetFields();
              }}
            >
              Update
            </Button>
            <Popconfirm
              title="Delete"
              description="Do you want to delete"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button type="primary" danger>
                Delete
              </Button>
            </Popconfirm>
          </div>
        </>
      ),
    },
  ];

  return (
    <div>
      <Button
        onClick={() => {
          form.resetFields();
          setShowModal(true);
        }}
        type="primary"
      >
        Create new {title}
      </Button>
      <Table loading={fetching} dataSource={datas} columns={tableColumn} />
      <Modal
        open={showModal}
        onCancel={() => setShowModal(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
      >
        <Form form={form} labelCol={{ span: 24 }} onFinish={handleSubmit}>
          <Form.Item name="id" label="id" hidden></Form.Item>
          {formItems}
        </Form>
      </Modal>
    </div>
  );
}

export default DashboardTemplate;
