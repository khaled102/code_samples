<?php

namespace App\Http\Controllers\API\Invitation;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Validator;
use Illuminate\Validation\Rule;
use Auth;
use App\User;
use App\Models\Cycle;
use App\Models\CycleMember;
use App\Models\Noti;
use App\Models\WalletFees;

class JoinController extends Controller
{
    public $successStatus = 200;

    /** 
     * join to from deep link
     * 
     * @return \Illuminate\Http\Response 
     */ 
    public function store(Request $request){ 
        
        $cycle_id = Cycle::where('code',$request->cycle_code)->get();
        $validator = Validator::make($request->all(), [ 
            'cycle_code'        => 'required',
            'collect_month'     => 'required',
            'action_id'         => 'required',
        ]);
        if ($validator->fails()) { 
            return response()->json(['error'=>$validator->errors()], 401);            
        }
        // return response()->json($cycle_id);
        $input = $request->all(); 
        $parts = explode('-', $cycle_id[0]->start_date);
        if($request->collect_month <= 9){
            $current_month = '0'.$request->collect_month;
        }else{
            $current_month = $request->collect_month;
        }
        $input['start_date'] = $parts[0].'-'.$current_month.'-'.$parts[2];
        $input['user_id'] = Auth::user()->id;
        $input['active']  = 1;
        $input['cycle_id']  = $cycle_id[0]->id;

        // old for getting duplicated user & month
        $old        = CycleMember::where('user_id',Auth::user()->id)->where('cycle_id',$cycle_id[0]->id)->where('collect_month',$request->collect_month)->get();
        // access for getting user joined number limited with 3
        $access     = CycleMember::where('user_id',Auth::user()->id)->where('cycle_id',$cycle_id[0]->id)->where('collect_month','!=',$request->collect_month)->get();
        // replace for getting used links before
        $replace    = CycleMember::where('cycle_id',$cycle_id[0]->id)->where('collect_month',$request->collect_month)->get();
        $success['cycle']       =   $old;
        $success['cycle_data']  =   $cycle_id;
        if(count($old) > 0){
            $response['duplicated']    =   'duplicated  request';
            return response()->json(['duplicated'=>$response], 409); 
        }elseif(count($replace) > 0){
            $response['taken']    =   'already taken';
            return response()->json(['taken'=>$response], 409); 
        }elseif(count($access) <= 2 ){
            $member         = CycleMember::create($input); 
            $noti           = new Noti;
            $noti->user_id  =  $cycle_id[0]->user_id;
            $noti->title    = 'Invitation you have been sent was accepted successfully';
            $noti->title_ar = 'الدعوة التي ارسلتها تم قبولها بنجاح';
            $noti->type     = 1;
            $noti->cycle_id = $cycle_id[0]->id;
            $noti->data     = Auth::user()->full_name.' has been accept your invitation';
            $noti->data_ar  = Auth::user()->full_name.' وافق على دعوتك للجمعيه ';
            $noti->save();
            $wallet = User::find($request->action_id);
            $fees = WalletFees::find(2);
            $current_amount = $wallet->wallet;
            $fees_amount    = ($fees->amount/100) *  $cycle_id[0]->amount_per_month;
            if($fees_amount > 20){
                $fees_amount = 20;
            }
            $wallet->wallet = $current_amount+$fees_amount;
            $wallet->save();
            $newMember = CycleMember::where('id',$member->id)->get();
            $success['cycle']       =   $newMember;
            $success['cycle_data']  =   $cycle_id;
            // return redirect()->route('PushNoti',['user_id' => $cycle_id[0]->user_id, 'status' => '1', 'action_id' => Auth::user()->id]);
            return response()->json(['success'=>$success], $this-> successStatus); 
        }else{
            $response['access']    =   'denied access request';
            return response()->json(['denied'=>$response], 409); 
        }
    }
}
