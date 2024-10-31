/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import CardComponent from "../dashboardCard";
import AreaChart from "../areaChart";
import BarChart from "../barChart";
import { useNavigate } from "react-router-dom";
import "./index.scss";
import api from "../config/api";
import { Button, Table } from "antd";
import moment from "moment";

const DashboardChard: React.FC = () => {
  const navigate = useNavigate();
  const [isData, setIsData] = useState<any>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);
  const [top5Pods, setTop5Pods] = useState<any[]>([]);
  const [selectedDate] = useState<moment.Moment | null>(moment());

  const fetchData = async () => {
    try {
      const response = await api.get("dashboard/revenue-stats");
      setIsData(response.data);
      const top5Pods = response.data.bestSellingPods
        .sort(
          (a: { totalBookings: number }, b: { totalBookings: number }) =>
            b.totalBookings - a.totalBookings
        )
        .slice(0, 5);
      setTop5Pods(top5Pods);
      const yearlyRevenue: any = [];
      for (let month = 1; month <= 12; month++) {
        const monthlyRevenueResponse = await api.get(
          `dashboard/revenue/monthly?month=${month}&year=${selectedDate?.year()}`
        );
        yearlyRevenue.push(monthlyRevenueResponse.data.revenue);
      }
      setMonthlyRevenue(yearlyRevenue);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!isData) {
    return (
      <div>
        {/* <Button type="dashed">
          Chỉ dành cho Admin. Bạn không được phép truy cập
        </Button> */}
      </div>
    );
  }

  const totalLocations = isData.locationCount;
  const totalPods = isData.podCount;
  const totalServices = isData.deviceCount;
  const totalDevices = isData.deviceCount;
  const areaChartLabels = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];
  const areaChartData = monthlyRevenue;
  const barChartLabels = isData.bestSellingPods.map(
    (pod: { podName: any }) => pod.podName
  );
  const barChartData = isData.bestSellingPods.map(
    (pod: { totalBookings: any }) => pod.totalBookings
  );
  const podColumns = [
    {
      title: "Pod Name",
      dataIndex: "podName",
      key: "podName",
    },
    {
      title: "Total Bookings",
      dataIndex: "totalBookings",
      key: "totalBookings",
    },
    {
      title: "Revenue",
      dataIndex: "revenue",
      key: "revenue",
      render: (revenue: number) => `${revenue.toLocaleString()} VND`,
    },
  ];

  return (
    <div className="dashboard-container">
      <div className="card-container">
        <CardComponent
          title={`Location (${totalLocations})`}
          color="#3f51b5"
          onClick={() => navigate("/dashboard/locations")}
        />
        <CardComponent
          title={`POD (${totalPods})`}
          color="#ff9800"
          onClick={() => navigate("/dashboard/pods")}
        />
        <CardComponent
          title={`Service (${totalServices})`}
          color="#4caf50"
          onClick={() => navigate("/dashboard/services")}
        />
        <CardComponent
          title={`Device (${totalDevices})`}
          color="#f44336"
          onClick={() => navigate("/dashboard/devices")}
        />
      </div>

      <div className="chart-container">
        <div className="chart">
          <div className="chart-title">Doanh thu</div>
          <AreaChart labels={areaChartLabels} data={areaChartData} />
        </div>
        <div className="chart">
          <div className="chart-title">Best Seller</div>
          <BarChart labels={barChartLabels} data={barChartData} />
        </div>
      </div>
      <div className="table-container">
        <h2>Top 5 POD được sử dụng nhiều nhất</h2>
        <Table dataSource={top5Pods} columns={podColumns} rowKey="podId" />
      </div>
    </div>
  );
};

export default DashboardChard;
