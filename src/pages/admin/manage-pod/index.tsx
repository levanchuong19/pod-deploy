/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Form,
  GetProp,
  Image,
  Input,
  InputNumber,
  Upload,
  UploadFile,
  UploadProps,
} from "antd";
import DashboardTemplate, {
  Column,
} from "../../../components/dashboard_template";
import { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";

function ManageLocation() {
  const title = "pods";

  const columns: Column[] = [
    {
      title: "No",
      key: "index",
      render: (_text: any, _record: any, index: number) => index + 1,
    },
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Capacity", dataIndex: "capacity", key: "capacity" },
    { title: "Area", dataIndex: "area", key: "area" },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Image",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (img: string | undefined) => <Image src={img} />,
    },
    { title: "PricePerHour", dataIndex: "pricePerHour", key: "pricePerHour" },
    { title: "LocationId", dataIndex: "locationId", key: "locationId" },
    { title: "DeviceId", dataIndex: "deviceId", key: "deviceId" },
  ];

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];
  const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) =>
    setFileList(newFileList);

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  const formItems = (
    <>
      <Form.Item
        name="name"
        label="Name"
        rules={[{ required: true, message: "Please enter the name" }]}
      >
        <Input placeholder="Enter name" />
      </Form.Item>

      {/* Capacity */}
      <Form.Item
        name="capacity"
        label="Capacity"
        rules={[{ required: true, message: "Please enter the capacity" }]}
      >
        <InputNumber
          placeholder="Enter capacity"
          min={0}
          style={{ width: "100%" }}
        />
      </Form.Item>

      {/* Area */}
      <Form.Item
        name="area"
        label="Area"
        rules={[{ required: true, message: "Please enter the area" }]}
      >
        <InputNumber
          placeholder="Enter area"
          min={0}
          style={{ width: "100%" }}
        />
      </Form.Item>

      {/* Description */}
      <Form.Item name="description" label="Description">
        <Input.TextArea placeholder="Enter description" />
      </Form.Item>

      {/* Price Per Hour */}
      <Form.Item
        name="pricePerHour"
        label="Price Per Hour"
        rules={[{ required: true, message: "Please enter the price per hour" }]}
      >
        <InputNumber
          placeholder="Enter price per hour"
          min={0}
          style={{ width: "100%" }}
        />
      </Form.Item>

      {/* Image Upload */}
      <Form.Item name="imageUrl" label="Image">
        <Upload
          // action="http://localhost:5088/api/upload"
          listType="picture-card"
          fileList={fileList}
          onPreview={handlePreview}
          onChange={handleChange}
        >
          {fileList.length == 1 ? null : uploadButton}
        </Upload>
        {previewImage && (
          <Image
            wrapperStyle={{ display: "none" }}
            preview={{
              visible: previewOpen,
              onVisibleChange: (visible) => setPreviewOpen(visible),
              afterOpenChange: (visible) => !visible && setPreviewImage(""),
            }}
            src={previewImage}
          />
        )}
      </Form.Item>

      {/*  LocationId */}
      <Form.Item label="LocationId" name="locationId">
        <Input />
      </Form.Item>

      {/*  DeviceId */}
      <Form.Item label="DeviceId" name="deviceId">
        <Input />
      </Form.Item>
    </>
  );
  return (
    <div>
      <DashboardTemplate
        fileList={fileList}
        title={title}
        columns={columns}
        formItems={formItems}
        apiURI="pods"
      />
    </div>
  );
}

export default ManageLocation;
