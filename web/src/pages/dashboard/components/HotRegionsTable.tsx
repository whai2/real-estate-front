import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { ProgressBar } from '@/components/ui/ProgressBar';
import {
  Table,
  TableHead,
  TableHeadCell,
  TableRow,
  TableCell,
} from '@/components/ui/Table';
import type { HotRegion } from '@/types/dashboard';

type HotRegionsTableProps = {
  regions: HotRegion[];
  onRegionFilter?: (region: string) => void;
};

const regionTabs = ['서울', '경기', '인천'];

// 샘플 데이터 (API 미연동 시 사용)
const sampleRegions: HotRegion[] = [
  { rank: 1, region: '강남구 역삼동', totalTrades: 4520, rankChange: 14, trend: 'up' },
  { rank: 2, region: '송파구 잠실동', totalTrades: 3891, rankChange: 8, trend: 'up' },
  { rank: 3, region: '용산구 한남동', totalTrades: 2750, rankChange: -2, trend: 'down' },
];

export function HotRegionsTable({ regions, onRegionFilter }: HotRegionsTableProps) {
  const [activeTab, setActiveTab] = useState('서울');
  const data = regions.length > 0 ? regions : sampleRegions;

  function handleTabClick(tab: string) {
    setActiveTab(tab);
    onRegionFilter?.(tab);
  }

  function getRiskScore(trades: number): number {
    if (trades > 4000) return 82;
    if (trades > 3000) return 68;
    return 32;
  }

  return (
    <section className="bg-surface-container-low p-8 rounded-3xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-black font-headline tracking-tight mb-2">
            지역별 거래 핫플레이스
          </h2>
          <p className="text-on-surface-variant text-sm">
            거래량 및 리스크 스코어 기준 상위 실적 지역 분석 결과입니다.
          </p>
        </div>
        <div className="flex bg-surface-container-highest p-1 rounded-lg">
          {regionTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`px-4 py-1.5 text-xs font-bold rounded-md ${
                activeTab === tab
                  ? 'bg-white shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <Table>
        <TableHead>
          <TableHeadCell>순위</TableHeadCell>
          <TableHeadCell>지역명</TableHeadCell>
          <TableHeadCell>거래량</TableHeadCell>
          <TableHeadCell>성장률</TableHeadCell>
          <TableHeadCell>평균 리스크</TableHeadCell>
          <TableHeadCell align="right">상세 보기</TableHeadCell>
        </TableHead>
        <tbody>
          {data.map((region) => {
            const riskScore = getRiskScore(region.totalTrades);
            const isNegative = region.rankChange < 0;

            return (
              <TableRow key={region.rank}>
                <TableCell>
                  <span className="font-bold text-lg text-primary">
                    {String(region.rank).padStart(2, '0')}
                  </span>
                </TableCell>
                <TableCell className="font-bold">{region.region}</TableCell>
                <TableCell className="text-sm">
                  {region.totalTrades.toLocaleString()} 건
                </TableCell>
                <TableCell>
                  <span
                    className={`font-bold text-xs ${isNegative ? 'text-error' : 'text-secondary'}`}
                  >
                    {isNegative ? '' : '+'}
                    {region.rankChange}%
                  </span>
                </TableCell>
                <TableCell>
                  <ProgressBar
                    value={riskScore}
                    color={riskScore < 40 ? 'bg-error' : 'bg-secondary'}
                  />
                </TableCell>
                <TableCell align="right">
                  <button className="p-2 hover:bg-surface-container-high rounded-lg transition-colors">
                    <Icon name="chevron_right" className="text-primary text-xl" />
                  </button>
                </TableCell>
              </TableRow>
            );
          })}
        </tbody>
      </Table>
    </section>
  );
}
