export interface StatsDto {
    studentCount: number;
    teacherCount: number;
    userCount: number;
    roleCount: number;
    dataEnterBarChart: ChartSeries[];
    studentByTeacherTypePieChart?: Record<string, number>;
}

export interface ChartSeries {
    name: string;
    data: number[];
}
