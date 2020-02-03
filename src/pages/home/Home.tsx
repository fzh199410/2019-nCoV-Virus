import * as React from "react";
import { Component } from "react";
import {
  getVirusDataOnTime,
  getVirusDataStatic,
  getRumor
} from "../../services/getData";
import { getMapData, getMapProvinceData } from "../../utils/getMapData";
import { Tabs, Card } from "antd-mobile";
import { Table, Divider } from "antd";
import dayjs from "dayjs";
import Map from "../map/Map";
import NewsList from "../news/News";
import Category from "../category/Category";
import Pie from "../pie/Pie";
import Rumor from "../rumor/Rumor"
import "antd-mobile/dist/antd-mobile.css";
import styles from "./style.module.css";

export interface HomeProps {}
export interface HomeState {
  timer: any;
  newsList?: [];
  caseList?: [];
  staticList: [];
  mapList: [];
  rumorList: [];
  virusDesc?: {
    confirmedCount: number;
    suspectedCount: number;
    deadCount: number;
    curedCount: number;
    seriousCount: number;
    seriousIncr: number;
    modifyTime: number;
    virus: string;
    infectSource: string;
    passWay: string;
    remark1: string;
    remark2: string;
    confirmedIncr: number;
    suspectedIncr: number;
    deadIncr: number;
    curedIncr: number;
  };
  provinceName?: string;
  tabIndex: number;
}

class Home extends Component<HomeProps, HomeState> {
  constructor(props: HomeProps) {
    super(props);
    this.state = {
      timer: null,
      newsList: [],
      caseList: [],
      virusDesc: {
        confirmedCount: 0,
        suspectedCount: 0,
        deadCount: 0,
        curedCount: 0,
        seriousCount: 0,
        modifyTime: 0,
        virus: "",
        infectSource: "",
        passWay: "",
        remark1: "",
        remark2: "",
        confirmedIncr: 0,
        suspectedIncr: 0,
        deadIncr: 0,
        curedIncr: 0,
        seriousIncr: 0
      },
      staticList: [],
      mapList: [],
      rumorList: [],
      provinceName: "", //是否点击了某个省份
      tabIndex: 0
    };
  }
  componentDidMount() {
    this.initData();
    // 10分钟更新一次数据
    this.setState({
      timer: setInterval(() => {
        this.initData();
      }, 1000 * 60 * 10)
    });
  }
  // 清除轮循
  componentWillUnmount() {
    const { timer } = this.state;
    clearInterval(timer);
    this.setState({ timer: null });
  }
  // 获取疫情数据
  initData = async () => {
    const res = await getVirusDataOnTime();
    if (res.status === 200) {
      // console.log(res.data.newslist);
      const { news, desc } = res.data.newslist[0];
      this.setState({
        newsList: news,
        virusDesc: desc,
        caseList: res.data.newslist[0].case
      });
    }
    const resuslt = await getVirusDataStatic();
    const { newslist } = resuslt.data;
    // console.log(result)
    const maplist = getMapData(newslist);
    this.setState({
      staticList: newslist,
      mapList: maplist
    });
    this.getRumorList();
  };
  getRumorList = async () => {
    const res = await getRumor();
    const { newslist} = res.data
    // console.log(newslist);
    this.setState({
      rumorList: newslist
    })
  };
  toProvince = province => {
    // console.log(province)
    const { staticList } = this.state;
    let cites: [] = [];
    let provinceName;
    for (let item of staticList as any) {
      if (province === item.provinceShortName) {
        cites = item.cities;
        provinceName = item.provinceName;
        break;
      }
    }
    if (cites.length !== 0) {
      const maplist = getMapProvinceData(cites, provinceName);
      this.setState({
        provinceName: province,
        mapList: maplist
      });
    } else {
      return;
    }
  };
  toCountry = () => {
    const { staticList } = this.state;
    const maplist = getMapData(staticList);
    this.setState({
      provinceName: "",
      mapList: maplist
    });
  };
  render() {
    const { virusDesc, mapList, provinceName, tabIndex, newsList, rumorList } = this.state;
    //console.log(newsList);
    const tabs = [
      { title: "疫情地图" },
      { title: "疫情趋势" },
      { title: "最新消息" },
      { title: "辟谣信息" }
    ];
    const columns = [
      { title: "地区", dataIndex: "name", key: "name" },
      { title: "确诊", dataIndex: "confirmedCount", key: "confirmedCount" },
      { title: "死亡", dataIndex: "deadCount", key: "deadCount" },
      { title: "治愈", dataIndex: "curedCount", key: "curedCount" }
    ];
    const expandedRowRender = item => {
      let mapList: [] = [];
      if (item.provinceName) {
        mapList = getMapProvinceData(item.cities, item.provinceName);
      }
      return mapList.length > 0 ? (
        <Table
          columns={columns}
          showHeader={false}
          rowKey={(record: any) => record.name}
          dataSource={mapList}
          pagination={false}
        />
      ) : null;
    };

    return (
      <div>
        <div className={styles.top}>
          <p className={styles.title}>新型冠状病毒肺炎疫情</p>
          <p className={styles.tip}>实时动态</p>
        </div>
        <Tabs
          tabs={tabs}
          initialPage={0}
          swipeable={false}
          tabBarInactiveTextColor="#616161"
          tabBarActiveTextColor="#6C63FF"
          tabBarUnderlineStyle={{ border: "1px #6C63FF solid" }}
          onChange={(tab, index) => {
            this.setState({
              tabIndex: index
            });
          }}
        >
          <div className={styles.map}>
            <span className={styles.allCountry}>全国</span>
            <span>
              截至{dayjs(virusDesc.modifyTime).format("YYYY年MM月DD日 HH:mm")}
              (北京时间)
            </span>
            <span>统计</span>
            <div className={styles.category}>
              <Category
                title={"确诊"}
                count={virusDesc.confirmedCount}
                addcount={virusDesc.confirmedIncr}
                color={"#f44336"}
              />
              <Category
                title={"疑似"}
                count={virusDesc.suspectedCount}
                addcount={virusDesc.suspectedIncr}
                color={"#ef6c00"}
              />
              <Category
                title={"重症"}
                count={virusDesc.seriousCount}
                addcount={virusDesc.seriousIncr}
                color={"#5d4037"}
              />
              <Category
                title={"死亡"}
                count={virusDesc.deadCount}
                addcount={virusDesc.deadIncr}
                color={"#263238"}
              />
              <Category
                title={"治愈"}
                count={virusDesc.curedCount}
                addcount={virusDesc.curedIncr}
                color={"#64dd17"}
              />
            </div>
            <Card>
              <Card.Body className={styles.card}>
                <div>
                  <span>病毒：</span>
                  {virusDesc.virus}
                </div>
                <div>
                  <span>传染源：</span>
                  {virusDesc.infectSource}
                </div>
                <div>{virusDesc.remark1}</div>
                <div>{virusDesc.remark2}</div>
                <div>
                  <span>传播途径：</span>
                  {virusDesc.passWay}
                </div>
              </Card.Body>
            </Card>
            <Map
              provinceName={provinceName}
              mapList={mapList}
              onClick={this.toProvince}
            />
            {provinceName ? (
              <div className={styles.maptip} onClick={this.toCountry}>
                返回全国
              </div>
            ) : null}
          </div>
          <div className={styles.trend}>
            <Pie virusDesc={virusDesc} />
            <Divider />
            <Pie virusDesc={virusDesc} />
          </div>
          <div className={styles.newsBox}>
            <NewsList newlist={newsList} />
          </div>
          <div className={styles.rumorBox}>
            <Rumor rumorList={rumorList} />
          </div>
        </Tabs>
        {tabIndex === 0 ? (
          <Table
            className={styles.table}
            columns={columns}
            pagination={false}
            expandedRowRender={item => expandedRowRender(item)}
            dataSource={mapList}
            rowKey={(record: any) => record.name}
          />
        ) : null}
      </div>
    );
  }
}

export default Home;