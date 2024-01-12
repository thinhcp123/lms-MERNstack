import { Document, Model } from "mongoose";

interface MonthData {
    month: string,
    count: number
}

export async function generateLast12MothsData<T extends Document>(model: Model<T>): Promise<{ last12Mounths: MonthData[] }> {
    const last12Mounths: MonthData[] = [];
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1)

    for (let i = 11; i >= 0; i--) {
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - i * 28);
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 28);

        const monthYear = endDate.toLocaleString('default', { day: "numeric", month: 'short', year: "numeric" });
        const count = await model.countDocuments({
            createdAt: { $gte: startDate, $lt: endDate }
        })
        last12Mounths.push({
            month: monthYear,
            count
        })

    }
    return { last12Mounths };
}