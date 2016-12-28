<?php

class fnXML
{
    //Получить XML строку из файла
    function getXMLstring($file)
    {
        if(file_exists($file))
        {
            return simplexml_load_file($file);
        }
        else
        {
            return false;
        }
    }

    //получить поле по id
    function getFieldToID($file,$id){
        if(file_exists($file))
        {
            $str=simplexml_load_file($file);

            foreach($str->fields[0] as $item)
            {
                 if($item['id']==$id)
                {
                    $id=$item['id'];
                    $number=$item->number;
                    $des=$item->description;

                    $output="<?xml version='1.0'?><data><fields><field id='".$id."'><number>".$number."</number><description>".$des."</description></field></fields></data>";
                    return simplexml_load_string($output);
                }
            }
        }
        else
        {
            return false;
        }
    }


    /*function getAllFieldsXML($file){
        if(file_exists($file))
        {
            $xml = simplexml_load_file($file);
            $fid=$xml->fid;

           foreach($xml->fields as $item)
           {
               $number=$item->field->number;

           }
        }
    }*/
}