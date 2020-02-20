<?php

namespace App\Http\Controllers\API\Wallet;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Auth;
use App\Models\ًWalletTracker;
use App\User;
use App\Models\CyclePayment;
use App\Models\CycleMember;

class walletController extends Controller
{
    public $successStatus = 200;
    /** 
     * return cashout wallet 
     * 
     * @return \Illuminate\Http\Response 
     */ 
    public function index(){
        $wallet = ًWalletTracker::where('user_id',Auth::user()->id)->where('status','0')->get();
        $response['wallet'] =   $wallet;
        return response()->json(['success'=>$response], $this-> successStatus); 
    }
    /** 
     * return request cashout wallet 
     * 
     * @return \Illuminate\Http\Response 
     */ 
    public function cashout()
    {
        $oldWallet = ًWalletTracker::where('user_id',Auth::user()->id)->where('status','0')->get();
        if(count($oldWallet) > 0){
            $oldWallet[0]->amount = Auth::user()->wallet + $oldWallet[0]->amount;
            $oldWallet[0]->save();
        }else{
            $wallet = new ًWalletTracker;
            $wallet->user_id = Auth::user()->id;
            $wallet->amount  = Auth::user()->wallet;
            $wallet->save();
        }
        $user = User::find(Auth::user()->id);
        $user->wallet = 0.00;
        $user->save();
        $response['wallet'] =   $wallet;
        return response()->json(['success'=>$response], $this-> successStatus); 
    }
    /** 
     * return wallet paid out histroy
     * 
     * @return \Illuminate\Http\Response 
     */ 
    public function PaidoutHistory()
    {
        $cycleid            = CycleMember::where('user_id',Auth::user()->id)->select('cycle_id')->get();
        $cyclePaidout       = CyclePayment::whereIn('cycle_id',$cycleid)->with('cycle')->orderBy('id','desc')->get();
        $response['wallet_history'] =   $cyclePaidout;
        return response()->json(['success'=>$response], $this-> successStatus); 
    }
    /** 
     * return wallet paid in histroy
     * 
     * @return \Illuminate\Http\Response 
     */ 
    public function PaidinHistory()
    {
        $cycleid              = CycleMember::where('user_id',Auth::user()->id)->select('cycle_id')->get();
        $cyclePaidin        = CyclePayment::whereIn('cycle_id',$cycleid)->with('cycle')->get();
        $response['paidin_history'] =   $cyclePaidin;
        return response()->json(['success'=>$response], $this-> successStatus); 
    }
}
