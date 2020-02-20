<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cycle extends Model
{
    
    protected $table = 'cycles';

    protected $fillable=['user_id','members_number','start_date','end_date','total_amount','amount_per_month','public','cycle_name','status','code'];


    public function user(){

        return $this->belongsTo('App\User','user_id');
    }

    public function cycleMember(){
        
        return $this->hasMany('App\Models\CycleMember')->with('user');
    }
    public function members(){
        
        return $this->hasMany('App\Models\CycleMember')->with('user');
    }
    public function walletTracker(){

        return $this->hasMany('App\Models\ًWalletTracker');
    }
    public function cyclePayment(){

        return $this->hasMany('App\Models\CyclePayment');
    }
    public function payment(){
        return $this->hasMany('App\Models\CyclePayment');
    }
}
