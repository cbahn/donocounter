import type { Request, Response } from "express";
import { getTotalFromDatabase } from '../db/getTotal.js';

export async function getTotalRoute(req: Request, res: Response) {
  const now = new Date();

  console.log("Hit the getTotalRoute");

  const result = await getTotalFromDatabase();



  res.status(200).type('json').send( {
    cutoffStartTime: result.cutoffStartTime,
    donationsTotal: result.totalCents / 100,
    donationsCount: result.donationCount,
  } );

}
