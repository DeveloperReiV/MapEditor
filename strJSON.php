<?php

class strJSON
{
    //public $array_point = null;     //������ �����
    //public  $array_polygon = null;  //������ ���������


    //�������� ������ ������� JSON
    //���������� ��� JSON ������
    //������ ������ JSON ������ � ���������� � �� ��������
    //������ ������� JSON ������ � ������� � �� ��������
    function get_geometry($json)
    {
        $json=json_decode($json,true);

        foreach($json['features'] as $key=>$value)
        {
            if($value['geometry']['type']=='Point')
            {
                $array_point[]=$json['features'][$key];
                unset($json['features'][$key]);
            }
        }
        return [json_encode($json),json_encode($array_point)];
    }
}