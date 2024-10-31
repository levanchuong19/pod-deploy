import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../components/config/api";
import { toast } from "react-toastify";
import dayjs, { Dayjs } from "dayjs";
import { useForm } from "antd/es/form/Form";
import { DatePicker, Form, Modal } from "antd";
import type { Service } from "../../components/modal/service";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  userId: string;
}

interface BookedSlot {
  startTime: string;
  endTime: string;
}

export default function UpdateBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = useForm();
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(true);

  useEffect(() => {
    const fetchBookedTimes = async () => {
      try {
        const response = await api.get(`bookings/${id}/booked-times`);
        setBookedSlots(response.data.data);
      } catch (error) {
        console.error("Error fetching booked times:", error);
        toast.error("Không thể lấy thông tin thời gian đã đặt.");
      }
    };
    fetchBookedTimes();
  }, [id]);

  // Reset time values when modal is opened
  useEffect(() => {
    if (isModalVisible) {
      setStartTime(null);
      setEndTime(null);
      form.resetFields(); // Reset the form fields
    }
  }, [isModalVisible, form]);

  const handleTimeChange = (timeRange: [Dayjs, Dayjs] | null) => {
    if (timeRange) {
      const [start, end] = timeRange;
      const timeDifference = end.diff(start, "minute");
      if (timeDifference < 60) {
        toast.error("Thời gian đặt phải ít nhất là 1 tiếng.");
        return;
      }
      const currentTime = dayjs().startOf("minute");
      const minBookingTime = currentTime.add(1, "hour");
      if (start.isBefore(minBookingTime)) {
        toast.error(
          "Vui lòng chọn thời gian sau ít nhất 1 tiếng so với thời gian hiện tại."
        );
        return;
      }
      setStartTime(start);
      setEndTime(end);
    } else {
      setStartTime(null);
      setEndTime(null);
    }
  };

  const handleUpdateBooking = async () => {
    if (!startTime || !endTime) {
      toast.error("Vui lòng lựa chọn khoảng thời gian đặt POD");
      return;
    }
    const token = localStorage.getItem("accessToken");
    if (token) {
      const decodedToken: JwtPayload = jwtDecode(token);
      const userId = decodedToken.userId;

      const bookingData = {
        accountId: userId,
        podId: id,
        startTime: startTime.format("YYYY-MM-DDTHH:mm:ss"),
        endTime: endTime.format("YYYY-MM-DDTHH:mm:ss"),
        paymentMethod: 0,
        bookingServices: selectedServices.map((service: Service) => ({
          serviceId: service.id,
          quantity: service.quantity,
        })),
      };

      try {
        const response = await api.put(`bookings/${id}`, bookingData);
        toast.success("Cập nhật booking thành công!");
        setIsModalVisible(false);
        navigate(`/confirmBooking/${response.data.data.id}`);
      } catch (error) {
        toast.error("Cập nhật booking thất bại. Vui lòng thử lại.");
        console.error(error);
      }
    }
  };

  const disabledDate = (current: Dayjs | null) => {
    return current && current.isBefore(dayjs(), "day");
  };

  const disabledTime = (date: Dayjs | null) => {
    if (!date) return { disabledHours: () => [], disabledMinutes: () => [] };

    const bookedTimes = bookedSlots.filter((slot) =>
      dayjs(slot.startTime).isSame(date, "day")
    );

    const disabledHours: number[] = [];
    bookedTimes.forEach(({ startTime, endTime }) => {
      const startHour = dayjs(startTime).hour();
      const endHour = dayjs(endTime).hour();
      for (let hour = startHour; hour < endHour; hour++) {
        disabledHours.push(hour);
      }
    });

    const restrictedHours = [...Array(7).keys()].concat(
      [...Array(13).keys()].map((i) => i + 22)
    );
    return {
      disabledHours: () => restrictedHours.concat(disabledHours),
      disabledMinutes: () => [],
    };
  };

  return (
    <Modal
      title="Cập nhật booking"
      visible={isModalVisible}
      onCancel={() => setIsModalVisible(false)}
      footer={null}
    >
      <Form form={form} onFinish={handleUpdateBooking}>
        <Form.Item
          name="date"
          rules={[
            { required: true, message: "Vui lòng lựa chọn ngày phù hợp" },
          ]}
        >
          <DatePicker.RangePicker
            disabledDate={disabledDate}
            showTime={{ disabledTime }}
            format="YYYY-MM-DD HH:mm"
            onChange={(value: any) => handleTimeChange(value)}
          />
        </Form.Item>
        {/* Add additional form items for service selection here */}
        <button type="submit">Cập nhật booking</button>
      </Form>
    </Modal>
  );
}
